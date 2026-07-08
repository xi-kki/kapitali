"""Groq + LlamaIndex RAG pipeline with streaming support."""

import logging
from typing import AsyncGenerator, Optional

from llama_index.core import (
    Settings,
    VectorStoreIndex,
    Document,
    StorageContext,
)
from llama_index.core.chat_engine import CondensePlusContextChatEngine
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.postprocessor import SimilarityPostprocessor
from llama_index.llms.groq import Groq
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.vector_stores.postgres import PGVectorStore
from sqlalchemy import create_engine

from app.core.config import settings

logger = logging.getLogger(__name__)


def get_llm() -> Groq:
    """Initialize Groq LLM."""
    return Groq(
        model=settings.GROQ_MODEL,
        api_key=settings.GROQ_API_KEY,
        temperature=0.1,
        max_tokens=4096,
    )


def get_embed_model() -> OpenAIEmbedding:
    """Initialize embedding model."""
    return OpenAIEmbedding(
        model=settings.EMBEDDINGS_MODEL,
        api_key=settings.OPENAI_API_KEY,
    )


def get_vector_store() -> Optional[PGVectorStore]:
    """Initialize pgvector store. Returns None if not available."""
    try:
        engine = create_engine(settings.DATABASE_URL)
        engine.connect().close()
        return PGVectorStore.from_params(
            host="localhost",
            port=5432,
            database="kapitali",
            user="postgres",
            password="postgres",
            table_name="kapitali_embeddings",
            embed_dim=1536,
        )
    except Exception as e:
        logger.warning(f"PostgreSQL/pgvector not available: {e}")
        return None


def get_chat_engine():
    """Build a chat engine with optional RAG."""
    llm = get_llm()

    # Configure global settings
    Settings.llm = llm
    Settings.embed_model = get_embed_model()
    Settings.chunk_size = 1024
    Settings.chunk_overlap = 200

    # Try vector store, fall back to no-RAG chat
    vector_store = get_vector_store()
    if vector_store:
        try:
            storage_context = StorageContext.from_defaults(vector_store=vector_store)
            index = VectorStoreIndex.from_vector_store(
                vector_store, storage_context=storage_context
            )
            retriever = index.as_retriever(similarity_top_k=5)

            return CondensePlusContextChatEngine(
                retriever=retriever,
                llm=llm,
                memory=ChatMemoryBuffer.from_defaults(token_limit=4096),
                node_postprocessors=[SimilarityPostprocessor(similarity_cutoff=0.7)],
                verbose=True,
            )
        except Exception as e:
            logger.warning(f"Vector store index failed, falling back to LLM-only: {e}")

    # Fallback: simple LLM-only chat
    from llama_index.core.chat_engine import SimpleChatEngine
    return SimpleChatEngine.from_defaults(llm=llm)


async def stream_chat(messages: list[dict]) -> AsyncGenerator[str, None]:
    """Stream a chat response from the RAG engine."""
    try:
        chat_engine = get_chat_engine()

        # Extract the latest user message
        user_message = messages[-1]["content"] if messages else "Hello"

        response = chat_engine.stream_chat(user_message)

        for token in response.response_gen:
            yield token

    except Exception as e:
        logger.error(f"Chat error: {e}")
        yield f"I encountered an error processing your request. Please try again or rephrase.\n\nError: {str(e)}"
