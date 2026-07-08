"""Kapitali Backend — FastAPI application entry point with RAG pipeline."""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import chat, documents, entities

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Kapitali API",
    description="Intelligence for Capital — Groq-powered RAG backend",
    version="0.1.0",
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(entities.router)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "version": "0.1.0",
        "groq_configured": bool(settings.GROQ_API_KEY),
        "model": settings.GROQ_MODEL,
    }


@app.on_event("startup")
async def startup():
    """Verify configuration on startup."""
    if not settings.GROQ_API_KEY:
        logger.warning("⚠️  GROQ_API_KEY not set — chat will fail")
    else:
        logger.info(f"✅ Groq configured with model: {settings.GROQ_MODEL}")

    if not settings.OPENAI_API_KEY:
        logger.warning("⚠️  OPENAI_API_KEY not set — using fallback embeddings")
    else:
        logger.info(f"✅ Embeddings configured with model: {settings.EMBEDDINGS_MODEL}")
