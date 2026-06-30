"""
Analyse de l'évolution sémantique d'un concept coranique
entre les périodes mecquoise et médinoise.

Les sourates mecquoises (610-622 CE) traitent principalement :
  - Tawhid (unicité de Dieu), eschatologie, foi, morale

Les sourates médinoises (622-632 CE) traitent principalement :
  - Législation sociale, fiqh, relations communautaires, jihad

Cet endpoint montre comment un concept évolue entre ces deux périodes.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel
from database import get_db
from embeddings import embed_query

router = APIRouter(prefix="/semantic-evolution", tags=["semantic-evolution"])


class AyahEntry(BaseModel):
    id: str
    reference: str
    arabic: str
    translation_fr: str | None
    surah_number: int
    surah_name: str
    revelation_order: int | None
    similarity: float


class PeriodAnalysis(BaseModel):
    period: str            # "meccan" | "medinan"
    period_label: str
    count: int
    avg_similarity: float
    top_ayahs: list[AyahEntry]


class EvolutionResponse(BaseModel):
    concept: str
    meccan: PeriodAnalysis
    medinan: PeriodAnalysis
    evolution_note: str


@router.get("", response_model=EvolutionResponse)
async def semantic_evolution(
    concept: str = Query(..., min_length=2, description="Concept coranique à analyser"),
    top_k: int = Query(default=5, le=10),
    db: AsyncSession = Depends(get_db),
):
    """
    Pour un concept donné, compare sa présence et son traitement
    dans les sourates mecquoises vs médinoises.
    """
    embedding = embed_query(concept)

    results: dict[str, list] = {"meccan": [], "medinan": []}

    for period in ("meccan", "medinan"):
        sql = text("""
            SELECT
                t.id::text,
                t.reference,
                t.arabic,
                t.translation_fr,
                (t.metadata->>'surah')::int      AS surah_number,
                sm.name_fr                        AS surah_name,
                sm.revelation_order,
                1 - (t.embedding <=> CAST(:embedding AS vector)) AS similarity
            FROM texts t
            JOIN sources s ON s.id = t.source_id
            LEFT JOIN surah_metadata sm
                   ON sm.surah_number = (t.metadata->>'surah')::int
            WHERE s.type = 'quran'
              AND t.embedding IS NOT NULL
              AND sm.revelation_period = :period
            ORDER BY t.embedding <=> CAST(:embedding AS vector)
            LIMIT :top_k
        """)

        embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"
        result = await db.execute(sql, {
            "embedding": embedding_str,
            "period": period,
            "top_k": top_k,
        })
        results[period] = result.fetchall()

    def build_period(period: str, rows: list, label: str) -> PeriodAnalysis:
        entries = [
            AyahEntry(
                id=r.id,
                reference=r.reference,
                arabic=r.arabic,
                translation_fr=r.translation_fr,
                surah_number=r.surah_number or 0,
                surah_name=r.surah_name or "",
                revelation_order=r.revelation_order,
                similarity=round(float(r.similarity), 4),
            )
            for r in rows
        ]
        avg = round(sum(e.similarity for e in entries) / len(entries), 4) if entries else 0.0
        return PeriodAnalysis(
            period=period,
            period_label=label,
            count=len(entries),
            avg_similarity=avg,
            top_ayahs=entries,
        )

    meccan_analysis = build_period("meccan", results["meccan"], "Période mecquoise (610–622 CE)")
    medinan_analysis = build_period("medinan", results["medinan"], "Période médinoise (622–632 CE)")

    diff = medinan_analysis.avg_similarity - meccan_analysis.avg_similarity
    if abs(diff) < 0.02:
        note = f"Le concept « {concept} » est traité de façon similaire dans les deux périodes."
    elif diff > 0:
        note = (f"Le concept « {concept} » est plus présent dans les sourates médinoises "
                f"(+{diff:.0%}), ce qui reflète son développement législatif et social.")
    else:
        note = (f"Le concept « {concept} » est plus ancré dans la période mecquoise "
                f"({abs(diff):.0%}), lié à la foi fondamentale et à l'eschatologie.")

    return EvolutionResponse(
        concept=concept,
        meccan=meccan_analysis,
        medinan=medinan_analysis,
        evolution_note=note,
    )
