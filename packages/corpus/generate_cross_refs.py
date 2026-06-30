"""
Génération automatique des cross-références Coran ↔ Hadith ↔ Tafsir.

Algorithme :
  Pour chaque paire (ayat, hadith/tafsir) :
    similarity = cosine(embedding_ayat, embedding_hadith)
    if similarity >= THRESHOLD : insérer dans cross_references

Optimisation : on ne calcule pas les N² paires naïvement.
On utilise pgvector pour retrouver les k plus proches voisins
de chaque ayat parmi les hadiths — O(n × k) au lieu de O(n²).

Usage :
    python generate_cross_refs.py [--threshold 0.72] [--top-k 10] [--dry-run]
"""

import sys
import json
import argparse
import psycopg2
from tqdm import tqdm
from db import get_connection

DEFAULT_THRESHOLD = 0.72
DEFAULT_TOP_K = 10


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--threshold", type=float, default=DEFAULT_THRESHOLD)
    parser.add_argument("--top-k", type=int, default=DEFAULT_TOP_K)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--source-type", default="quran", choices=["quran", "hadith", "tafsir"],
        help="Type source pour lequel chercher des connexions"
    )
    parser.add_argument(
        "--target-types", nargs="+", default=["hadith", "tafsir"],
        help="Types cibles à connecter"
    )
    return parser.parse_args()


def get_texts_with_embeddings(conn, source_type: str) -> list[tuple]:
    """Retourne (id, reference) pour tous les textes d'un type ayant un embedding."""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT t.id::text, t.reference
            FROM texts t
            JOIN sources s ON s.id = t.source_id
            WHERE s.type = %s AND t.embedding IS NOT NULL
        """, (source_type,))
        return cur.fetchall()


def find_nearest(conn, text_id: str, target_types: list[str], top_k: int, threshold: float) -> list[dict]:
    """Trouve les top_k textes les plus proches d'un text_id dans les types cibles."""
    with conn.cursor() as cur:
        placeholders = ",".join(["%s"] * len(target_types))
        cur.execute(f"""
            SELECT
                t.id::text AS target_id,
                s.type     AS target_type,
                1 - (t.embedding <=> (
                    SELECT embedding FROM texts WHERE id = %s::uuid
                ))          AS similarity
            FROM texts t
            JOIN sources s ON s.id = t.source_id
            WHERE s.type IN ({placeholders})
              AND t.id != %s::uuid
              AND t.embedding IS NOT NULL
              AND 1 - (t.embedding <=> (
                    SELECT embedding FROM texts WHERE id = %s::uuid
                  )) >= %s
            ORDER BY t.embedding <=> (SELECT embedding FROM texts WHERE id = %s::uuid)
            LIMIT %s
        """, (text_id, *target_types, text_id, text_id, threshold, text_id, top_k))
        rows = cur.fetchall()
        return [{"target_id": r[0], "target_type": r[1], "similarity": float(r[2])} for r in rows]


def insert_cross_refs(conn, source_id: str, connections: list[dict]) -> int:
    if not connections:
        return 0
    inserted = 0
    with conn.cursor() as cur:
        for c in connections:
            ref_type = "tafsir" if c["target_type"] == "tafsir" else "context"
            cur.execute("""
                INSERT INTO cross_references (source_id, target_id, ref_type, confidence, auto_generated)
                VALUES (%s::uuid, %s::uuid, %s, %s, TRUE)
                ON CONFLICT DO NOTHING
            """, (source_id, c["target_id"], ref_type, round(c["similarity"], 4)))
            inserted += cur.rowcount
    return inserted


def main():
    args = parse_args()
    conn = get_connection()

    print(f"Paramètres : threshold={args.threshold}, top_k={args.top_k}, dry_run={args.dry_run}")
    print(f"Source : {args.source_type} → Cibles : {args.target_types}")

    sources = get_texts_with_embeddings(conn, args.source_type)
    print(f"\n{len(sources)} textes sources trouvés.")

    total_inserted = 0
    total_connections = 0

    for text_id, reference in tqdm(sources, desc="Cross-références"):
        connections = find_nearest(
            conn, text_id, args.target_types, args.top_k, args.threshold
        )
        total_connections += len(connections)

        if not args.dry_run and connections:
            n = insert_cross_refs(conn, text_id, connections)
            total_inserted += n

    if not args.dry_run:
        conn.commit()
        print(f"\n✓ {total_inserted} cross-références insérées.")
    else:
        print(f"\n[DRY RUN] {total_connections} connexions seraient créées.")

    conn.close()


if __name__ == "__main__":
    main()
