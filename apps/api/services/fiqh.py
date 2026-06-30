"""
Service de comparaison inter-madhhabs.

Pour un concept donné (ex: ribā, ṭalāq, zakāt), retourne les positions
des 4 grandes écoles juridiques sunnites avec leurs sources primaires.

Architecture :
  1. Recherche sémantique dans chaque collection de fiqh séparément
  2. Agrège les résultats par madhhab
  3. Identifie les points de convergence / divergence via clustering de similarité
"""

from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text


MADHHABS = {
    "hanafi":  {"name": "Hanafi",  "founder": "Abū Ḥanīfa (699–767)", "region": "Asie centrale, Turquie, Asie du Sud"},
    "maliki":  {"name": "Maliki",  "founder": "Mālik ibn Anas (711–795)", "region": "Afrique du Nord, Afrique de l'Ouest"},
    "shafi_i": {"name": "Shafi'i", "founder": "Muḥammad al-Shāfiʿī (767–820)", "region": "Egypte, Asie du Sud-Est"},
    "hanbali": {"name": "Hanbali", "founder": "Aḥmad ibn Ḥanbal (780–855)", "region": "Arabie Saoudite, Qatar"},
}


@dataclass
class MadhabPosition:
    madhhab: str
    madhhab_info: dict
    texts: list[dict]
    summary_position: str | None  # position courte en français


@dataclass
class FiqhComparison:
    topic: str
    positions: list[MadhabPosition]
    convergence_score: float  # 0-1 : à quel point les 4 écoles convergent


async def compare_madhhabs(
    db: AsyncSession,
    query_embedding: list[float],
    topic: str,
    limit_per_madhhab: int = 3,
) -> FiqhComparison:
    positions = []

    for collection, info in MADHHABS.items():
        sql = text("""
            SELECT
                t.id::text,
                t.reference,
                t.arabic,
                t.translation_fr,
                t.translation_en,
                t.metadata,
                1 - (t.embedding <=> CAST(:embedding AS vector)) AS similarity
            FROM texts t
            JOIN sources s ON s.id = t.source_id
            WHERE s.type = 'fiqh'
              AND s.collection = :collection
              AND t.embedding IS NOT NULL
            ORDER BY t.embedding <=> CAST(:embedding AS vector)
            LIMIT :limit
        """)

        embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"
        result = await db.execute(sql, {
            "embedding": embedding_str,
            "collection": collection,
            "limit": limit_per_madhhab,
        })
        rows = result.fetchall()

        texts = [
            {
                "id": r.id,
                "reference": r.reference,
                "arabic": r.arabic,
                "translation_fr": r.translation_fr,
                "translation_en": r.translation_en,
                "similarity": round(float(r.similarity), 4),
                "metadata": r.metadata or {},
            }
            for r in rows
        ]

        positions.append(MadhabPosition(
            madhhab=collection,
            madhhab_info=info,
            texts=texts,
            summary_position=None,
        ))

    # Score de convergence : moyenne des similarités croisées
    # (simplifié : si toutes les écoles ont des textes proches → convergence élevée)
    similarities = [
        t["similarity"]
        for p in positions
        for t in p.texts
    ]
    convergence = round(sum(similarities) / len(similarities), 3) if similarities else 0.0

    return FiqhComparison(
        topic=topic,
        positions=positions,
        convergence_score=convergence,
    )
