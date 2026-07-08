"""Document ingestion service — PDFs, CSVs, and text files."""

import logging
import os
from typing import List
from pathlib import Path

from llama_index.core import Document, VectorStoreIndex, Settings
from llama_index.core.node_parser import SentenceSplitter
from llama_index.readers.file import PDFReader, CSVReader, DocxReader

from app.core.config import settings
from app.services.rag import get_llm, get_embed_model, get_vector_store

logger = logging.getLogger(__name__)

# Allowed file extensions
ALLOWED_EXTENSIONS = {".pdf", ".csv", ".docx", ".txt", ".md", ".xlsx"}


def is_allowed(filename: str) -> bool:
    """Check if file extension is supported."""
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS


def get_reader_for_file(filename: str):
    """Get the appropriate reader for a file type."""
    ext = Path(filename).suffix.lower()
    readers = {
        ".pdf": PDFReader(),
        ".csv": CSVReader(),
        ".docx": DocxReader(),
        ".txt": None,  # Plain text
        ".md": None,   # Markdown
    }
    return readers.get(ext)


async def ingest_document(filepath: str, filename: str) -> dict:
    """Ingest a single document into the vector store."""
    try:
        # Configure LLM and embedding
        Settings.llm = get_llm()
        Settings.embed_model = get_embed_model()
        Settings.node_parser = SentenceSplitter(chunk_size=1024, chunk_overlap=200)

        reader = get_reader_for_file(filename)

        if reader:
            docs = reader.load_data(filepath)
        else:
            # Plain text/markdown
            with open(filepath, "r", encoding="utf-8") as f:
                text = f.read()
            docs = [Document(text=text, metadata={"filename": filename})]

        # Add metadata
        for doc in docs:
            doc.metadata["filename"] = filename
            doc.metadata["filetype"] = Path(filename).suffix.lower()

        # Index into vector store
        vector_store = get_vector_store()
        if vector_store:
            index = VectorStoreIndex.from_documents(
                docs,
                vector_store=vector_store,
                show_progress=True,
            )
        else:
            logger.warning("No vector store available — document indexed in memory only")

        return {
            "status": "indexed",
            "filename": filename,
            "chunks": len(docs),
            "size_bytes": os.path.getsize(filepath),
        }

    except Exception as e:
        logger.error(f"Ingestion failed for {filename}: {e}")
        return {"status": "error", "filename": filename, "error": str(e)}


async def ingest_csv_crm(filepath: str, filename: str) -> dict:
    """Ingest a CRM CSV export — parses investors, companies, deals."""
    import csv

    records = {"investors": 0, "companies": 0, "deals": 0}

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            docs = []

            for row in reader:
                row_type = row.get("type", "").lower().strip()
                name = row.get("name", row.get("company", row.get("investor", "Unknown")))

                text = f"{name}: {row.get('description', '')}"
                if row.get("notes"):
                    text += f"\nNotes: {row['notes']}"
                if row.get("tags"):
                    text += f"\nTags: {row['tags']}"

                doc = Document(
                    text=text,
                    metadata={
                        "filename": filename,
                        "entity_type": row_type,
                        "name": name,
                        "source": "crm_import",
                    },
                )
                docs.append(doc)

                if row_type in records:
                    records[row_type] += 1
                else:
                    records["investors"] += 1

        if docs:
            vector_store = get_vector_store()
            if vector_store:
                index = VectorStoreIndex.from_documents(docs, vector_store=vector_store)

        return {
            "status": "indexed",
            "filename": filename,
            "records": records,
            "total": len(docs),
        }

    except Exception as e:
        logger.error(f"CRM import failed: {e}")
        return {"status": "error", "filename": filename, "error": str(e)}
