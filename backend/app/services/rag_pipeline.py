"""
Kapitali RAG Pipeline — SQLite FTS + Groq

Architecture decision: Keyword-based retrieval via SQLite FTS5 for MVP
- FTS5 is built into Python (zero deps), fast, and great for name/entity search
- Investor data needs exact name matching (Sequoia, Anthropic) — FTS excels here
- Upgrade path: swap to pgvector + embeddings when scaling to >10k docs

Data flow:
  1. User query → FTS5 keyword search → top-k document chunks
  2. Retrieved chunks → formatted as context with source citations
  3. Context + query → Groq → streamed answer with inline citations
"""

import logging
import sqlite3
import os
from typing import AsyncGenerator

from groq import AsyncGroq
from app.core.config import settings

logger = logging.getLogger(__name__)

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "kapitali.db")

SYSTEM_PROMPT = """You are Kapitali, an AI investor copilot for venture capital and investment professionals.

You have access to retrieved context from the team's CRM, documents, and notes. 
Answer using ONLY the provided context. If the context doesn't contain enough information, say so.

**Guidelines:**
- Cite sources inline using [1], [2] etc., matching the source numbers provided
- Be concise, professional, and data-driven
- Use markdown for structure (headings, bullet points, bold for key data)
- If asked about something not in the context, say "I don't have that information in your data"

**Context below is retrieved from the team's knowledge base:"""


def get_top_chunks(query: str, limit: int = 5) -> list[dict]:
    """
    Retrieve relevant document chunks using SQLite FTS5 full-text search.
    Falls back to simple LIKE search if FTS5 index isn't built yet.
    """
    results = []

    if not os.path.exists(DB_PATH):
        logger.info("No database yet — returning empty results")
        return results

    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Try FTS5 search first
        try:
            # Sanitize query for FTS5
            safe_query = " OR ".join(query.split())
            cursor.execute(
                """SELECT d.id, d.content, d.filename, d.entity_name, d.entity_type, d.chunk_index
                   FROM documents_fts f
                   JOIN documents d ON f.rowid = d.id
                   WHERE documents_fts MATCH ?
                   ORDER BY rank
                   LIMIT ?""",
                (safe_query, limit),
            )
            results = [dict(row) for row in cursor.fetchall()]
        except Exception as e:
            logger.warning(f"FTS5 search failed, falling back to LIKE: {e}")
            # Fallback: simple LIKE search
            like_query = f"%{query}%"
            cursor.execute(
                """SELECT id, content, filename, entity_name, entity_type, chunk_index
                   FROM documents
                   WHERE content LIKE ? OR filename LIKE ? OR entity_name LIKE ?
                   LIMIT ?""",
                (like_query, like_query, like_query, limit),
            )
            results = [dict(row) for row in cursor.fetchall()]

        conn.close()

    except Exception as e:
        logger.error(f"Search error: {e}")

    return results


def format_context(chunks: list[dict]) -> str:
    """Format retrieved chunks into a numbered context string with citations."""
    if not chunks:
        return ""

    parts = []
    for i, chunk in enumerate(chunks, 1):
        source = chunk.get("filename", chunk.get("entity_name", "Unknown"))
        parts.append(f"[{i}] Source: {source}")
        parts.append(chunk.get("content", ""))
        parts.append("")

    return "\n".join(parts)


async def stream_rag_response(messages: list[dict]) -> AsyncGenerator[str, None]:
    """
    Full RAG pipeline: retrieve → augment → generate (streaming).

    1. Extract the user's latest query
    2. Search FTS index for relevant document chunks
    3. Format context with source citations
    4. Stream Groq response with context
    """
    groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    # 1. Get the latest user message
    user_message = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            user_message = msg.get("content", "")
            break

    # 2. Retrieve relevant context
    chunks = get_top_chunks(user_message)
    context = format_context(chunks)

    logger.info(f"RAG query: '{user_message[:50]}...' → {len(chunks)} chunks retrieved")

    # 3. Build the Groq messages
    groq_messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if context:
        groq_messages.append({
            "role": "system",
            "content": f"Retrieved context from your CRM and documents:\n\n{context}",
        })

    # Add conversation history (last 10 messages for context window)
    for msg in messages[-10:]:
        groq_messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", ""),
        })

    # Add source list at the end for citation formatting
    if chunks:
        source_list = "\n\n**Sources retrieved:**\n"
        for i, chunk in enumerate(chunks, 1):
            src = chunk.get("filename", chunk.get("entity_name", f"Document {i}"))
            source_list += f"{i}. {src}\n"
        groq_messages.append({
            "role": "system",
            "content": f"When citing sources, use the numbered references [1], [2] etc. from the context above.{source_list}",
        })

    # 4. Stream response from Groq
    try:
        stream = await groq_client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=groq_messages,
            temperature=0.1,
            max_tokens=4096,
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices and len(chunk.choices) > 0:
                delta = chunk.choices[0].delta
                if delta and delta.content:
                    yield delta.content

    except Exception as e:
        logger.error(f"Groq API error: {e}")
        yield f"\n\n> ⚠️ Error: {str(e)}\n\nPlease check your GROQ_API_KEY and try again."
