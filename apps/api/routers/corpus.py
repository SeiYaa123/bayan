from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database import get_db

router = APIRouter(prefix="/corpus", tags=["corpus"])

COLLECTION_LABELS = {
    "bukhari":   "Sahih Bukhari",
    "muslim":    "Sahih Muslim",
    "abu_dawud": "Sunan Abu Dawud",
    "tirmidhi":  "Jami' al-Tirmidhi",
    "nasai":     "Sunan al-Nasa'i",
    "ibn_majah": "Sunan Ibn Majah",
}

TAFSIR_LABELS = {
    "jalalayn":  "Tafsir al-Jalalayn",
    "ibn_kathir": "Tafsir Ibn Kathir",
    "tabari":    "Tafsir al-Tabari",
}


@router.get("/quran/surahs")
async def list_surahs(db: AsyncSession = Depends(get_db)):
    sql = text("""
        SELECT
            (t.metadata->>'surah')::int   AS number,
            t.metadata->>'surah_name'     AS name_arabic,
            COUNT(*)::int                 AS ayah_count
        FROM texts t
        JOIN sources s ON s.id = t.source_id
        WHERE s.type = 'quran'
        GROUP BY t.metadata->>'surah', t.metadata->>'surah_name'
        ORDER BY (t.metadata->>'surah')::int
    """)
    result = await db.execute(sql)
    return [dict(r._mapping) for r in result.fetchall()]


@router.get("/quran/{surah}")
async def get_surah(surah: int, db: AsyncSession = Depends(get_db)):
    if surah < 1 or surah > 114:
        raise HTTPException(status_code=400, detail="Surah number must be between 1 and 114")

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
        ORDER BY (t.metadata->>'ayah')::int
    """)
    result = await db.execute(sql, {"surah": str(surah)})
    rows = result.fetchall()

    if not rows:
        raise HTTPException(status_code=404, detail=f"Surah {surah} not found")

    ayahs = [dict(r._mapping) for r in rows]
    return {
        "surah": surah,
        "surah_name": ayahs[0]["metadata"]["surah_name"] if ayahs else "",
        "ayah_count": len(ayahs),
        "ayahs": ayahs,
    }


@router.get("/hadith")
async def list_hadith_collections(db: AsyncSession = Depends(get_db)):
    sql = text("""
        SELECT
            s.collection,
            COUNT(*)::int               AS total,
            COUNT(t.translation_en)::int AS has_en
        FROM texts t
        JOIN sources s ON s.id = t.source_id
        WHERE s.type = 'hadith'
        GROUP BY s.collection
        ORDER BY s.collection
    """)
    result = await db.execute(sql)
    return [
        {**dict(r._mapping), "label": COLLECTION_LABELS.get(r.collection, r.collection)}
        for r in result.fetchall()
    ]


@router.get("/hadith/{collection}")
async def get_hadith_collection(
    collection: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    count_result = await db.execute(
        text("""
            SELECT COUNT(*)::int AS total
            FROM texts t
            JOIN sources s ON s.id = t.source_id
            WHERE s.type = 'hadith' AND s.collection = :collection
        """),
        {"collection": collection},
    )
    total = count_result.scalar() or 0
    if total == 0:
        raise HTTPException(status_code=404, detail=f"Collection '{collection}' not found or empty")

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
        WHERE s.type = 'hadith' AND s.collection = :collection
        ORDER BY (t.metadata->>'number')::numeric
        LIMIT :limit OFFSET :offset
    """)
    result = await db.execute(sql, {"collection": collection, "limit": limit, "offset": offset})
    return {
        "collection": collection,
        "label": COLLECTION_LABELS.get(collection, collection),
        "total": total,
        "limit": limit,
        "offset": offset,
        "hadiths": [dict(r._mapping) for r in result.fetchall()],
    }


@router.get("/tafsir")
async def list_tafsir_collections(db: AsyncSession = Depends(get_db)):
    sql = text("""
        SELECT
            s.collection,
            COUNT(*)::int AS total
        FROM texts t
        JOIN sources s ON s.id = t.source_id
        WHERE s.type = 'tafsir'
        GROUP BY s.collection
        ORDER BY s.collection
    """)
    result = await db.execute(sql)
    return [
        {**dict(r._mapping), "label": TAFSIR_LABELS.get(r.collection, r.collection)}
        for r in result.fetchall()
    ]


@router.get("/tafsir/{collection}/surahs")
async def list_tafsir_surahs(collection: str, db: AsyncSession = Depends(get_db)):
    sql = text("""
        SELECT
            (t.metadata->>'surah')::int   AS number,
            t.metadata->>'surah_name'     AS name_arabic,
            COUNT(*)::int                 AS ayah_count
        FROM texts t
        JOIN sources s ON s.id = t.source_id
        WHERE s.type = 'tafsir' AND s.collection = :collection
        GROUP BY t.metadata->>'surah', t.metadata->>'surah_name'
        ORDER BY (t.metadata->>'surah')::int
    """)
    result = await db.execute(sql, {"collection": collection})
    rows = result.fetchall()
    if not rows:
        raise HTTPException(status_code=404, detail=f"Tafsir '{collection}' not found or empty")
    return [dict(r._mapping) for r in rows]


@router.get("/tafsir/{collection}/{surah}")
async def get_tafsir_surah(collection: str, surah: int, db: AsyncSession = Depends(get_db)):
    if surah < 1 or surah > 114:
        raise HTTPException(status_code=400, detail="Surah number must be between 1 and 114")

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
        WHERE s.type = 'tafsir'
          AND s.collection = :collection
          AND t.metadata->>'surah' = :surah
        ORDER BY (t.metadata->>'ayah')::int
    """)
    result = await db.execute(sql, {"collection": collection, "surah": str(surah)})
    rows = result.fetchall()

    if not rows:
        raise HTTPException(status_code=404, detail=f"Tafsir '{collection}' surah {surah} not found")

    entries = [dict(r._mapping) for r in rows]
    return {
        "collection": collection,
        "label": TAFSIR_LABELS.get(collection, collection),
        "surah": surah,
        "surah_name": entries[0]["metadata"].get("surah_name", "") if entries else "",
        "ayah_count": len(entries),
        "entries": entries,
    }
