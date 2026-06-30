"""
Recherche hybride : sémantique (pgvector) + keyword (pg_trgm) combinée via RRF.

Reciprocal Rank Fusion : score = Σ 1 / (k + rank_i)
k=60 est la valeur standard (Cormack et al., 2009).
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from dataclasses import dataclass

RRF_K = 60


@dataclass
class SearchHit:
    id: str
    reference: str
    arabic: str
    translation_fr: str | None
    translation_en: str | None
    source_type: str
    collection: str
    metadata: dict
    score: float
    match_type: str  # "semantic" | "keyword" | "hybrid"


async def hybrid_search(
    db: AsyncSession,
    query: str,
    query_embedding: list[float],
    types: list[str],
    limit: int = 20,
    offset: int = 0,
    candidate_pool: int = 100,
) -> list[SearchHit]:
    """
    1. Récupère top-N par similarité cosine (semantic leg)
    2. Récupère top-N par similarité trigramme (keyword leg)
    3. Fusionne via RRF
    4. Retourne les `limit` meilleurs après offset
    """
    type_filter = "AND s.type = ANY(:types)" if types else ""

    # --- Leg sémantique ---
    semantic_sql = text(f"""
        SELECT
            t.id::text,
            t.reference,
            t.arabic,
            t.translation_fr,
            t.translation_en,
            s.type  AS source_type,
            s.collection,
            t.metadata,
            ROW_NUMBER() OVER (ORDER BY t.embedding <=> CAST(:embedding AS vector)) AS rank
        FROM texts t
        JOIN sources s ON s.id = t.source_id
        WHERE t.embedding IS NOT NULL
          {type_filter}
        ORDER BY t.embedding <=> CAST(:embedding AS vector)
        LIMIT :pool
    """)

    # --- Leg keyword (trigramme arabe) ---
    keyword_sql = text(f"""
        SELECT
            t.id::text,
            t.reference,
            t.arabic,
            t.translation_fr,
            t.translation_en,
            s.type  AS source_type,
            s.collection,
            t.metadata,
            ROW_NUMBER() OVER (ORDER BY similarity(t.arabic, :query) DESC) AS rank
        FROM texts t
        JOIN sources s ON s.id = t.source_id
        WHERE t.arabic % :query
          {type_filter}
        ORDER BY similarity(t.arabic, :query) DESC
        LIMIT :pool
    """)

    embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"
    params: dict = {"embedding": embedding_str, "query": query, "pool": candidate_pool}
    if types:
        params["types"] = types

    sem_result = await db.execute(semantic_sql, params)
    sem_rows = {row.id: row for row in sem_result.fetchall()}

    kw_result = await db.execute(keyword_sql, params)
    kw_rows = {row.id: row for row in kw_result.fetchall()}

    # --- RRF fusion ---
    all_ids = set(sem_rows) | set(kw_rows)
    scores: dict[str, float] = {}
    for doc_id in all_ids:
        score = 0.0
        if doc_id in sem_rows:
            score += 1.0 / (RRF_K + sem_rows[doc_id].rank)
        if doc_id in kw_rows:
            score += 1.0 / (RRF_K + kw_rows[doc_id].rank)
        scores[doc_id] = score

    ranked_ids = sorted(scores, key=lambda x: scores[x], reverse=True)
    page = ranked_ids[offset : offset + limit]

    hits: list[SearchHit] = []
    for doc_id in page:
        row = sem_rows.get(doc_id) or kw_rows[doc_id]
        in_sem = doc_id in sem_rows
        in_kw = doc_id in kw_rows
        match_type = "hybrid" if (in_sem and in_kw) else ("semantic" if in_sem else "keyword")

        hits.append(
            SearchHit(
                id=doc_id,
                reference=row.reference,
                arabic=row.arabic,
                translation_fr=row.translation_fr,
                translation_en=row.translation_en,
                source_type=row.source_type,
                collection=row.collection,
                metadata=row.metadata or {},
                score=round(scores[doc_id], 6),
                match_type=match_type,
            )
        )

    return hits
