"""Chat API — streaming endpoint for the Kapitali RAG pipeline."""

import json
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services.rag import stream_chat

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    messages: list[dict]
    stream: bool = True


class ChatResponse(BaseModel):
    content: str
    sources: list[dict] = []


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """Stream a chat response from the Groq + LlamaIndex RAG pipeline."""
    if not request.messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    async def generate():
        try:
            async for token in stream_chat(request.messages):
                if token:
                    yield f"data: {json.dumps({'content': token})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.error(f"Stream error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/chat", response_model=ChatResponse)
async def chat_sync(request: ChatRequest):
    """Non-streaming chat endpoint."""
    if not request.messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    content = ""
    try:
        async for token in stream_chat(request.messages):
            content += token
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return ChatResponse(content=content)
