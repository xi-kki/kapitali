"""Document ingestion service — lightweight file processing without LlamaIndex."""

import csv
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".pdf", ".csv", ".docx", ".txt", ".md"}


def is_allowed(filename: str) -> bool:
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS


async def ingest_document(filepath: str, filename: str) -> dict:
    """Process a document (stub — actual RAG ingestion uses the Groq pipeline)."""
    import time
    time.sleep(0.1)  # simulate processing
    return {
        "status": "indexed",
        "filename": filename,
        "chunks": 1,
        "size_bytes": os.path.getsize(filepath) if os.path.exists(filepath) else 0,
    }


async def ingest_csv_crm(filepath: str, filename: str) -> dict:
    """Parse a CRM CSV and return record counts."""
    records = {"investors": 0, "companies": 0, "deals": 0}
    total = 0

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                row_type = row.get("type", "").lower().strip()
                if row_type in records:
                    records[row_type] += 1
                else:
                    records["investors"] += 1
                total += 1
    except Exception as e:
        logger.error(f"CRM CSV parse error: {e}")
        return {"status": "error", "filename": filename, "error": str(e)}

    return {
        "status": "indexed",
        "filename": filename,
        "records": records,
        "total": total,
    }
