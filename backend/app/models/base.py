"""SQLAlchemy models for Kapitali — documents, entities, conversation history."""

import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float, JSON, text
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./kapitali.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class Document(Base):
    """Stored document chunks for RAG retrieval."""
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String(255), index=True)
    chunk_index = Column(Integer, default=0)
    content = Column(Text, nullable=False)
    entity_name = Column(String(255), nullable=True)
    entity_type = Column(String(50), nullable=True)  # investor, company, deal
    source = Column(String(50), default="upload")  # upload, crm_import
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Entity(Base):
    """CRM entities — investors, companies, deals."""
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_type = Column(String(50), nullable=False, index=True)  # investor, company, deal
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    tags = Column(JSON, nullable=True)
    strength = Column(String(20), default="medium")  # strong, medium, weak
    stage = Column(String(50), nullable=True)  # for deals
    last_interaction = Column(String(50), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Conversation(Base):
    """Chat history for institutional memory."""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=True)
    messages = Column(JSON, nullable=False, default=list)
    folder = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


def init_db():
    """Create all tables and enable FTS5 for full-text search."""
    Base.metadata.create_all(bind=engine)

    # Enable FTS5 on documents table for keyword search
    with engine.connect() as conn:
        conn.execute(
            text("CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(content, filename, entity_name, content=documents)")
        )
        conn.commit()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
