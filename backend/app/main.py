"""
Kapitali Backend — FastAPI application with Groq-powered RAG pipeline.

Architecture:
  - SQLite FTS5 for document/CRM retrieval (zero deps, fast entity search)
  - Groq LPU for ultra-fast LLM inference (sub-3s responses)
  - Streaming SSE for real-time token-by-token delivery
  - Seed data for immediate RAG demo capability

Data flow:
  User query → SQLite FTS search (top-5 chunks) → Groq with context → streamed cited answer
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import chat, documents, entities, conversations, export
from app.services.ingestion import seed_sample_data
from app.models.base import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and seed data on startup."""
    logger.info("🚀 Kapitali backend starting up...")

    # 1. Initialize SQLite database with FTS5
    init_db()
    logger.info("✅ Database initialized (SQLite + FTS5)")

    # 2. Seed sample CRM data for immediate RAG demo
    await seed_sample_data()

    # 3. Verify Groq configuration
    if not settings.GROQ_API_KEY:
        logger.warning("⚠️  GROQ_API_KEY not set — chat will fail")
    else:
        logger.info(f"✅ Groq configured — model: {settings.GROQ_MODEL}")

    yield

    logger.info("🛑 Kapitali backend shutting down...")


app = FastAPI(
    title="Kapitali API",
    description="Intelligence for Capital — Groq-powered RAG backend with institutional memory",
    version="1.2.0",
    lifespan=lifespan,
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004", "http://localhost:3005"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(entities.router)
app.include_router(conversations.router)
app.include_router(export.router)


@app.get("/health")
async def health():
    """Health check with RAG pipeline status."""
    import os
    db_exists = os.path.exists("./kapitali.db")
    return {
        "status": "ok",
        "version": "1.2.0",
        "groq_configured": bool(settings.GROQ_API_KEY),
        "model": settings.GROQ_MODEL,
        "rag_pipeline": "SQLite FTS5 + Groq (production: pgvector)",
        "database": "kapitali.db exists" if db_exists else "not yet created",
    }


@app.get("/api/rag/status")
async def rag_status():
    """Detailed RAG pipeline status — document count, entity count, etc."""
    from app.models.base import SessionLocal, Document, Entity

    db = SessionLocal()
    try:
        doc_count = db.query(Document).count()
        entity_count = db.query(Entity).count()
        sources = [row[0] for row in db.query(Document.source).distinct().all()]
        return {
            "documents": doc_count,
            "entities": entity_count,
            "sources": sources,
            "retrieval_method": "SQLite FTS5 full-text search",
            "llm": settings.GROQ_MODEL,
            "status": "ready" if doc_count > 0 else "no data — upload documents or import CRM",
        }
    finally:
        db.close()
