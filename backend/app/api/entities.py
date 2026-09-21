"""Entity search API — investors, companies, deals from the database."""

import logging
from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.models.base import SessionLocal, Entity

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/entities", tags=["entities"])


class EntityResult(BaseModel):
    id: str
    name: str
    type: str
    description: str
    tags: list[str] = []
    strength: str = "medium"
    stage: str | None = None
    last_interaction: str | None = None


@router.get("/search")
async def search_entities(
    query: str = Query(..., description="Search query"),
    type: str | None = Query(None, description="Filter by type: investor, company, deal"),
):
    """Search across investors, companies, and deals from the database."""
    db = SessionLocal()
    try:
        q = db.query(Entity)

        if type:
            q = q.filter(Entity.entity_type == type)

        if query and query.strip():
            search = f"%{query.strip()}%"
            q = q.filter(
                Entity.name.ilike(search)
                | Entity.description.ilike(search)
            )

        entities = q.all()

        results = [
            EntityResult(
                id=str(e.id),
                name=e.name,
                type=e.entity_type,
                description=e.description or "",
                tags=e.tags or [],
                strength=e.strength or "medium",
                stage=e.stage,
                last_interaction=e.last_interaction,
            )
            for e in entities
        ]

        return {"results": results, "total": len(results)}
    finally:
        db.close()


@router.get("/stats")
async def entity_stats():
    """Get entity counts by type."""
    db = SessionLocal()
    try:
        investors = db.query(Entity).filter(Entity.entity_type == "investor").count()
        companies = db.query(Entity).filter(Entity.entity_type == "company").count()
        deals = db.query(Entity).filter(Entity.entity_type == "deal").count()
        total = db.query(Entity).count()
        return {
            "total": total,
            "investors": investors,
            "companies": companies,
            "deals": deals,
        }
    finally:
        db.close()
