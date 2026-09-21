"""Conversation history API — save, list, load chat sessions."""

import json
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.models.base import SessionLocal, Conversation

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/conversations", tags=["conversations"])


class ConversationCreate(BaseModel):
    title: str = "New conversation"
    folder: str | None = None
    messages: list[dict] = []


class ConversationUpdate(BaseModel):
    title: str | None = None
    folder: str | None = None
    messages: list[dict] | None = None


@router.get("")
async def list_conversations(folder: str | None = None):
    """List all conversations, optionally filtered by folder."""
    db = SessionLocal()
    try:
        query = db.query(Conversation).order_by(Conversation.updated_at.desc())
        if folder:
            query = query.filter(Conversation.folder == folder)
        convos = query.all()
        return {
            "conversations": [
                {
                    "id": c.id,
                    "title": c.title or "Untitled",
                    "folder": c.folder,
                    "message_count": len(c.messages) if c.messages else 0,
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                    "updated_at": c.updated_at.isoformat() if c.updated_at else None,
                }
                for c in convos
            ]
        }
    finally:
        db.close()


@router.post("")
async def create_conversation(req: ConversationCreate):
    """Create a new conversation."""
    db = SessionLocal()
    try:
        conv = Conversation(
            title=req.title,
            folder=req.folder,
            messages=req.messages,
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)
        return {"id": conv.id, "title": conv.title, "folder": conv.folder}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.get("/{conv_id}")
async def get_conversation(conv_id: int):
    """Get a conversation by ID with full message history."""
    db = SessionLocal()
    try:
        conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {
            "id": conv.id,
            "title": conv.title,
            "folder": conv.folder,
            "messages": conv.messages or [],
            "created_at": conv.created_at.isoformat() if conv.created_at else None,
            "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
        }
    finally:
        db.close()


@router.put("/{conv_id}")
async def update_conversation(conv_id: int, req: ConversationUpdate):
    """Update a conversation (title, folder, messages)."""
    db = SessionLocal()
    try:
        conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if req.title is not None:
            conv.title = req.title
        if req.folder is not None:
            conv.folder = req.folder
        if req.messages is not None:
            conv.messages = req.messages
        import datetime
        conv.updated_at = datetime.datetime.utcnow()
        db.commit()
        return {"ok": True}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.delete("/{conv_id}")
async def delete_conversation(conv_id: int):
    """Delete a conversation."""
    db = SessionLocal()
    try:
        conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        db.delete(conv)
        db.commit()
        return {"ok": True}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
