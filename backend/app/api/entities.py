"""Entity search API — investors, companies, deals."""

import logging
from fastapi import APIRouter, Query
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/entities", tags=["entities"])


class EntityResult(BaseModel):
    id: str
    name: str
    type: str
    description: str
    tags: list[str] = []


@router.get("/search")
async def search_entities(
    query: str = Query(..., description="Search query"),
    type: str | None = Query(None, description="Filter by type: investor, company, deal"),
):
    """Search across investors, companies, and deals."""
    # TODO: Implement semantic search via pgvector + LlamaIndex
    # For now returns mock data matching the frontend
    results = [
        EntityResult(
            id="1",
            name="Sequoia Capital",
            type="investor",
            description="Leading VC firm with $85B AUM. Focus on AI, enterprise, and consumer tech.",
            tags=["AI Infrastructure", "Enterprise", "Growth Stage"],
        ),
        EntityResult(
            id="2",
            name="Anthropic",
            type="company",
            description="AI safety company building Claude LLM. Recently raised $2B Series E.",
            tags=["AI Infrastructure", "Generative AI"],
        ),
    ]

    filtered = [r for r in results if not type or r.type == type]
    filtered = [
        r for r in filtered
        if query.lower() in r.name.lower() or query.lower() in r.description.lower()
    ]

    return {"results": filtered, "total": len(filtered)}
