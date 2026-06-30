from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel
from database import get_db
from embeddings import embed_query
from services.fiqh import compare_madhhabs, MADHHABS

router = APIRouter(prefix="/fiqh", tags=["fiqh"])


class MadhabInfo(BaseModel):
    name: str
    founder: str
    region: str


class TextEntry(BaseModel):
    id: str
    reference: str
    arabic: str
    translation_fr: str | None
    translation_en: str | None
    similarity: float
    metadata: dict


class MadhabPosition(BaseModel):
    madhhab: str
    madhhab_info: MadhabInfo
    texts: list[TextEntry]


class ComparisonResponse(BaseModel):
    topic: str
    positions: list[MadhabPosition]
    convergence_score: float


@router.get("/compare", response_model=ComparisonResponse)
async def compare(
    topic: str = Query(..., min_length=2, description="Concept à comparer (ex: riba, zakat, talaq)"),
    limit: int = Query(default=3, le=5, description="Textes par madhhab"),
    db: AsyncSession = Depends(get_db),
):
    """Retourne les positions des 4 madhhabs sunnites sur un concept de fiqh."""
    embedding = embed_query(topic)
    result = await compare_madhhabs(db, embedding, topic, limit_per_madhhab=limit)

    return ComparisonResponse(
        topic=result.topic,
        convergence_score=result.convergence_score,
        positions=[
            MadhabPosition(
                madhhab=p.madhhab,
                madhhab_info=MadhabInfo(**p.madhhab_info),
                texts=[TextEntry(**t) for t in p.texts],
            )
            for p in result.positions
        ],
    )


@router.get("/madhhabs")
async def list_madhhabs():
    """Liste les 4 madhhabs avec leurs informations."""
    return {"madhhabs": MADHHABS}


@router.get("/topics")
async def suggest_topics(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
):
    """Auto-complétion des topics de fiqh basée sur les références disponibles."""
    sql = text("""
        SELECT DISTINCT t.reference, t.metadata->>'topic' AS topic
        FROM texts t
        JOIN sources s ON s.id = t.source_id
        WHERE s.type = 'fiqh'
          AND t.reference ILIKE :q
        LIMIT 10
    """)
    result = await db.execute(sql, {"q": f"%{q}%"})
    rows = result.fetchall()
    return {"suggestions": [dict(r._mapping) for r in rows]}
