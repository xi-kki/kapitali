"""Document upload and management API."""

import logging
import os
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from app.services.ingestion import ingest_document, ingest_csv_crm, is_allowed
from app.models.base import SessionLocal, Document

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/documents", tags=["documents"])


class DocumentResponse(BaseModel):
    status: str
    filename: str
    chunks: int = 0
    size_bytes: int = 0
    records: dict | None = None
    error: str | None = None


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload and ingest a document (PDF, CSV, DOCX, TXT, MD)."""
    if not file.filename or not is_allowed(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: PDF, CSV, DOCX, TXT, MD, XLSX",
        )

    try:
        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Ingest based on type
        ext = os.path.splitext(file.filename)[1].lower()
        if ext == ".csv":
            result = await ingest_csv_crm(tmp_path, file.filename)
        else:
            result = await ingest_document(tmp_path, file.filename)

        # Cleanup
        os.unlink(tmp_path)

        return DocumentResponse(**result)

    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list")
async def list_documents():
    """List all ingested documents with metadata."""
    db = SessionLocal()
    try:
        docs = db.query(Document).all()
        # Group by filename for the library view
        seen = {}
        for doc in docs:
            fn = doc.filename
            if fn not in seen:
                seen[fn] = {
                    "filename": fn,
                    "source": doc.source,
                    "entity_name": doc.entity_name,
                    "entity_type": doc.entity_type,
                    "chunks": 0,
                    "created_at": doc.created_at.isoformat() if doc.created_at else None,
                }
            seen[fn]["chunks"] += 1
        return {"documents": list(seen.values()), "total": len(seen)}
    finally:
        db.close()
