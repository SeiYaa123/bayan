from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select
from database import get_db
from models import TextUnit, Source

router = APIRouter(prefix="/texts", tags=["texts"])


@router.get("/{text_id}")
async def get_text(text_id: str, db: AsyncSession = Depends(get_db)):
    sql = text("""
        SELECT
            t.id::text,
            t.reference,
            t.arabic,
            t.translation_fr,
            t.translation_en,
            t.metadata,
            s.type AS source_type,
            s.collection
        FROM texts t
        JOIN sources s ON s.id = t.source_id
        WHERE t.id = CAST(:id AS uuid)
    """)
    result = await db.execute(sql, {"id": text_id})
    row = result.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Text not found")

    return dict(row._mapping)


@router.get("/quran/{surah}/{ayah}")
async def get_ayah(surah: int, ayah: int, db: AsyncSession = Depends(get_db)):
    sql = text("""
        SELECT
            t.id::text,
            t.reference,
            t.arabic,
            t.translation_fr,
            t.translation_en,
            t.metadata
        FROM texts t
        JOIN sources s ON s.id = t.source_id
        WHERE s.type = 'quran'
          AND t.metadata->>'surah' = :surah
          AND t.metadata->>'ayah' = :ayah
        LIMIT 1
    """)
    result = await db.execute(sql, {"surah": str(surah), "ayah": str(ayah)})
    row = result.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Ayah not found")

    # Récupère les connexions (hadiths liés, tafsir)
    connections_sql = text("""
        SELECT
            t.id::text,
            t.reference,
            t.arabic,
            t.translation_fr,
            s.type AS source_type,
            s.collection,
            cr.ref_type,
            cr.confidence
        FROM cross_references cr
        JOIN texts t ON t.id = cr.target_id
        JOIN sources s ON s.id = t.source_id
        WHERE cr.source_id = CAST(:text_id AS uuid)
        ORDER BY s.type, cr.confidence DESC
    """)
    conn_result = await db.execute(connections_sql, {"text_id": row.id})
    connections = [dict(r._mapping) for r in conn_result.fetchall()]

    return {**dict(row._mapping), "connections": connections}
