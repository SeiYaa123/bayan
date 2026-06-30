"""
Navigation dans la chaîne de transmission (isnad) d'un hadith.

L'isnad est le pilier de l'authenticité en sciences du hadith :
une chaîne ininterrompue de transmetteurs depuis le Prophète ﷺ.
Chaque transmetteur a un grade de fiabilité (jarh wa ta'dil).
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel
from database import get_db

router = APIRouter(prefix="/isnad", tags=["isnad"])


class NarratorNode(BaseModel):
    id: str
    name_arabic: str
    name_transliterated: str | None
    death_year: int | None
    reliability: str | None
    position: int
    transmission_type: str | None


class IsnadChain(BaseModel):
    hadith_id: str
    hadith_reference: str
    chain: list[NarratorNode]
    chain_length: int
    weakest_link: str | None   # narrator le moins fiable
    overall_grade: str         # sahih / hasan / da'if / unknown


RELIABILITY_RANK = {"thiqah": 3, "sadouq": 2, "da_if": 0, "unknown": 1}
GRADE_LABELS = {3: "sahih", 2: "hasan", 1: "da'if (inconnu)", 0: "da'if"}


def compute_overall_grade(chain: list[NarratorNode]) -> tuple[str, str | None]:
    if not chain:
        return "unknown", None
    min_reliability = min(
        RELIABILITY_RANK.get(n.reliability or "unknown", 1) for n in chain
    )
    weakest = next(
        (n.name_arabic for n in chain
         if RELIABILITY_RANK.get(n.reliability or "unknown", 1) == min_reliability),
        None,
    )
    return GRADE_LABELS.get(min_reliability, "unknown"), weakest


@router.get("/{hadith_id}", response_model=IsnadChain)
async def get_isnad(hadith_id: str, db: AsyncSession = Depends(get_db)):
    """Retourne la chaîne de transmission complète d'un hadith."""

    # Vérifie que le hadith existe
    text_sql = text("""
        SELECT t.id::text, t.reference, s.type
        FROM texts t JOIN sources s ON s.id = t.source_id
        WHERE t.id = CAST(:id AS uuid) AND s.type = 'hadith'
        LIMIT 1
    """)
    text_result = await db.execute(text_sql, {"id": hadith_id})
    hadith_row = text_result.fetchone()
    if not hadith_row:
        raise HTTPException(status_code=404, detail="Hadith introuvable")

    # Récupère la chaîne
    chain_sql = text("""
        SELECT
            n.id::text,
            n.name_arabic,
            n.name_transliterated,
            n.death_year,
            n.reliability,
            il.position,
            il.transmission_type
        FROM isnad_links il
        JOIN narrators n ON n.id = il.narrator_id
        WHERE il.hadith_id = CAST(:hadith_id AS uuid)
        ORDER BY il.position ASC
    """)
    chain_result = await db.execute(chain_sql, {"hadith_id": hadith_id})
    chain_rows = chain_result.fetchall()

    chain = [
        NarratorNode(
            id=r.id,
            name_arabic=r.name_arabic,
            name_transliterated=r.name_transliterated,
            death_year=r.death_year,
            reliability=r.reliability,
            position=r.position,
            transmission_type=r.transmission_type,
        )
        for r in chain_rows
    ]

    overall_grade, weakest_link = compute_overall_grade(chain)

    return IsnadChain(
        hadith_id=hadith_row.id,
        hadith_reference=hadith_row.reference,
        chain=chain,
        chain_length=len(chain),
        weakest_link=weakest_link,
        overall_grade=overall_grade,
    )


@router.get("/narrator/{narrator_id}")
async def get_narrator_hadiths(narrator_id: str, db: AsyncSession = Depends(get_db)):
    """Tous les hadiths transmis par un narrator donné."""
    sql = text("""
        SELECT
            t.id::text,
            t.reference,
            t.arabic,
            s.collection,
            il.position,
            il.transmission_type
        FROM isnad_links il
        JOIN texts t ON t.id = il.hadith_id
        JOIN sources s ON s.id = t.source_id
        WHERE il.narrator_id = CAST(:narrator_id AS uuid)
        ORDER BY s.collection, t.reference
        LIMIT 50
    """)
    result = await db.execute(sql, {"narrator_id": narrator_id})
    rows = result.fetchall()
    return {"hadiths": [dict(r._mapping) for r in rows]}
