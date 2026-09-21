"""Chat API — streaming RAG endpoint with source citations."""

import json
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services.rag_pipeline import stream_rag_response

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    messages: list[dict]
    stream: bool = True


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """Stream a RAG response from Groq with CRM/document context."""
    if not request.messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    async def generate():
        try:
            async for token in stream_rag_response(request.messages):
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


@router.post("/chat")
async def chat_sync(request: ChatRequest):
    """Non-streaming chat endpoint with sources."""
    if not request.messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    content = ""
    try:
        async for token in stream_rag_response(request.messages):
            content += token
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "content": content,
        "sources": [],  # Sources are inline in the response via [1], [2] references
    }
