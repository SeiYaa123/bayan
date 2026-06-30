from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel
from database import get_db
from embeddings import embed_query
from services.search import hybrid_search
from services.cache import get_cached_search, set_cached_search
from services.analytics import record_search

router = APIRouter(prefix="/search", tags=["search"])


class SearchResult(BaseModel):
    id: str
    reference: str
    arabic: str
    translation_fr: str | None
    translation_en: str | None
    source_type: str
    collection: str
    score: float
    match_type: str
    metadata: dict


class SearchResponse(BaseModel):
    results: list[SearchResult]
    total: int
    query: str


@router.get("", response_model=SearchResponse)
async def search(
    request: Request,
    q: str = Query(..., min_length=2),
    types: list[str] = Query(default=[]),
    limit: int = Query(default=20, le=50),
    offset: int = Query(default=0),
    db: AsyncSession = Depends(get_db),
):
    redis = request.app.state.redis

    cached = await get_cached_search(redis, q, types, limit, offset)
    if cached:
        await record_search(redis, q, types)
        return SearchResponse(**cached)

    embedding = embed_query(q)
    hits = await hybrid_search(
        db=db,
        query=q,
        query_embedding=embedding,
        types=types,
        limit=limit,
        offset=offset,
    )

    response = SearchResponse(
        results=[SearchResult(**h.__dict__) for h in hits],
        total=len(hits),
        query=q,
    )

    await set_cached_search(redis, q, types, limit, offset, response.model_dump())
    await record_search(redis, q, types)
    return response


@router.get("/{text_id}/connections")
async def get_connections(text_id: str, db: AsyncSession = Depends(get_db)):
    sql = text("""
        SELECT
            t.id::text,
            t.reference,
            t.arabic,
            t.translation_fr,
            s.type  AS source_type,
            s.collection,
            cr.ref_type,
            cr.confidence
        FROM cross_references cr
        JOIN texts t ON t.id = cr.target_id
        JOIN sources s ON s.id = t.source_id
        WHERE cr.source_id = CAST(:id AS uuid)
        ORDER BY cr.confidence DESC
        LIMIT 50
    """)
    result = await db.execute(sql, {"id": text_id})
    return {"connections": [dict(r._mapping) for r in result.fetchall()]}
