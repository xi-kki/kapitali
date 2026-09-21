"""Document and CRM data ingestion — stores content in SQLite for RAG retrieval."""

import csv
import logging
import os
from pathlib import Path

from sqlalchemy.orm import Session
from app.models.base import engine, SessionLocal, Document, Entity, init_db

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".pdf", ".csv", ".docx", ".txt", ".md"}


def is_allowed(filename: str) -> bool:
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS


def chunk_text(text: str, filename: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """Split text into overlapping chunks for RAG retrieval."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks


async def ingest_document(filepath: str, filename: str) -> dict:
    """Ingest a document: read text, chunk it, store in SQLite."""
    init_db()
    db = SessionLocal()

    try:
        # Read file content
        ext = Path(filename).suffix.lower()
        if ext == ".txt" or ext == ".md":
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        elif ext == ".csv":
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        else:
            # For PDF/DOCX, read as text (full parsing would need PyMuPDF/python-docx)
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()

        # Chunk the text
        chunks = chunk_text(text, filename)

        # Store chunks in DB
        for i, chunk in enumerate(chunks):
            doc = Document(
                filename=filename,
                chunk_index=i,
                content=chunk,
                source="upload",
            )
            db.add(doc)

        db.commit()

        return {
            "status": "indexed",
            "filename": filename,
            "chunks": len(chunks),
            "size_bytes": os.path.getsize(filepath) if os.path.exists(filepath) else 0,
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Ingestion failed for {filename}: {e}")
        return {"status": "error", "filename": filename, "error": str(e)}
    finally:
        db.close()


async def ingest_csv_crm(filepath: str, filename: str) -> dict:
    """Parse a CRM CSV and store entities + document chunks in SQLite."""
    init_db()
    db = SessionLocal()

    records = {"investors": 0, "companies": 0, "deals": 0}
    doc_chunks = []

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                row_type = row.get("type", "investor").lower().strip()
                name = row.get("name", row.get("company", row.get("investor", "Unknown")))
                description = row.get("description", "")
                notes = row.get("notes", "")
                tags_str = row.get("tags", "")

                # Combine fields into searchable content
                content = f"{name}: {description}"
                if notes:
                    content += f"\nNotes: {notes}"
                if tags_str:
                    content += f"\nTags: {tags_str}"

                # Store as document chunk for RAG
                doc = Document(
                    filename=filename,
                    chunk_index=0,
                    content=content,
                    entity_name=name,
                    entity_type=row_type,
                    source="crm_import",
                )
                db.add(doc)
                doc_chunks.append(content)

                # Also store as structured entity
                entity = Entity(
                    entity_type=row_type,
                    name=name,
                    description=description,
                    tags=[t.strip() for t in tags_str.split(",") if t.strip()],
                    strength=row.get("strength", "medium"),
                    stage=row.get("stage", ""),
                    last_interaction=row.get("last_interaction", ""),
                )
                db.add(entity)

                if row_type in records:
                    records[row_type] += 1

        db.commit()

        return {
            "status": "indexed",
            "filename": filename,
            "records": records,
            "total": sum(records.values()),
        }

    except Exception as e:
        db.rollback()
        logger.error(f"CRM import failed: {e}")
        return {"status": "error", "filename": filename, "error": str(e)}
    finally:
        db.close()


async def seed_sample_data():
    """
    Seed the database with sample CRM data so the RAG has something to retrieve.
    This demonstrates the institutional memory capability with realistic investor data.
    """
    init_db()
    db = SessionLocal()

    try:
        # Check if data already exists
        existing = db.query(Entity).count()
        if existing > 0:
            logger.info(f"Database already has {existing} entities — skipping seed")
            return

        sample_entities = [
            # Investors
            {"type": "investor", "name": "Sequoia Capital", "description": "Leading VC firm with $85B AUM. Focus on AI, enterprise, and consumer tech. Known for early investments in Google, Stripe, and OpenAI. Key partner for Series A-B rounds in AI infrastructure.", "tags": "AI Infrastructure, Enterprise, Growth Stage", "strength": "strong", "last_interaction": "June 2025"},
            {"type": "investor", "name": "Andreessen Horowitz", "description": "Silicon Valley VC with $42B AUM. Heavy focus on AI, crypto, and bio/fintech. Active in Series A-B rounds. Strong network in enterprise sales.", "tags": "AI, Crypto, Bio/Fintech", "strength": "medium", "last_interaction": "March 2025"},
            {"type": "investor", "name": "Lightspeed Venture Partners", "description": "Global VC with $25B AUM. Focus on enterprise, consumer, and crypto. Led Anthropic's Series E. Expanding AI infrastructure investments.", "tags": "Enterprise, AI, Crypto", "strength": "medium", "last_interaction": "April 2025"},
            {"type": "investor", "name": "Accel", "description": "VC firm with $30B AUM. Strong in enterprise SaaS and infrastructure. Early investor in CrowdStrike, Atlassian, and Slack.", "tags": "Enterprise SaaS, Infrastructure", "strength": "weak", "last_interaction": "January 2025"},

            # Companies
            {"type": "company", "name": "Anthropic", "description": "AI safety company building Claude LLM. Recently raised $2B Series E at $60B valuation led by Lightspeed. Strong in enterprise AI safety research. Growing enterprise customer base.", "tags": "AI Infrastructure, Generative AI, Safety", "strength": "medium", "last_interaction": "April 2025"},
            {"type": "company", "name": "Groq", "description": "AI hardware company building the LPU (Language Processing Unit) for ultra-fast inference. Key technology partner for Kapitali. $640M Series D at $2.8B valuation.", "tags": "AI Hardware, Inference, Infrastructure", "strength": "strong", "last_interaction": "July 2025"},
            {"type": "company", "name": "OpenAI", "description": "Leading AI research company behind GPT-4 and DALL-E. $80B valuation. Expanding into enterprise with ChatGPT Enterprise and API platform.", "tags": "AI, Foundation Models, Enterprise", "strength": "weak", "last_interaction": "December 2024"},

            # Deals
            {"type": "deal", "name": "Anthropic Series E", "description": "$2B round at $60B valuation. Led by Lightspeed with participation from existing investors. Funds will be used for AI safety research and compute infrastructure.", "tags": "Active, AI Infrastructure", "strength": "active", "stage": "Closed"},
            {"type": "deal", "name": "Groq Series D", "description": "$640M round at $2.8B valuation. Expansion of LPU manufacturing capacity. New data center partnerships for ultra-fast inference deployment.", "tags": "Active, AI Hardware", "strength": "active", "stage": "Closing"},
        ]

        for e in sample_entities:
            entity = Entity(
                entity_type=e["type"],
                name=e["name"],
                description=e["description"],
                tags=[t.strip() for t in e["tags"].split(",")],
                strength=e.get("strength", "medium"),
                stage=e.get("stage", ""),
                last_interaction=e.get("last_interaction", ""),
            )
            db.add(entity)

            # Also add as searchable document chunk
            doc = Document(
                filename="crm_seed_data.csv",
                chunk_index=0,
                content=f"{e['name']}: {e['description']}",
                entity_name=e["name"],
                entity_type=e["type"],
                source="crm_import",
            )
            db.add(doc)

        db.commit()
        logger.info(f"✅ Seeded {len(sample_entities)} sample entities + document chunks for RAG")

    except Exception as e:
        db.rollback()
        logger.error(f"Seed failed: {e}")
    finally:
        db.close()
