"""
ingest_tafsir.py — Ingestion du Tafsir al-Jalalayn (arabe) dans la base.

Source : fawazahmed0/quran-api (CC0)
  https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-jalaladdinalmah.min.json

Format JSON : {"quran": [{"chapter": N, "verse": N, "text": "..."}, ...]}
6 236 entrées (une par ayat).

Embeddings générés avec intfloat/multilingual-e5-large (dim 1024).

Usage :
    python ingest_tafsir.py              # ingestion complète
    python ingest_tafsir.py --dry-run   # aperçu sans écriture
"""

import json
import sys
import requests
from tqdm import tqdm
from db import get_connection
from embedder import embed_passages

JALALAYN_URL = (
    "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1"
    "/editions/ara-jalaladdinalmah.min.json"
)

BATCH_SIZE = 64
DRY_RUN = "--dry-run" in sys.argv


def fetch_json(url: str):
    print(f"Téléchargement : {url}")
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    return r.json()


def get_or_create_source(conn) -> str:
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM sources WHERE collection = 'jalalayn' LIMIT 1")
        row = cur.fetchone()
        if row:
            print(f"Source jalalayn existante : {row[0]}")
            return str(row[0])

        cur.execute(
            """
            INSERT INTO sources (type, collection, language, metadata)
            VALUES ('tafsir', 'jalalayn', 'ar', '{"label": "Tafsir al-Jalalayn", "century": 15}')
            RETURNING id
            """,
        )
        source_id = str(cur.fetchone()[0])
        conn.commit()
        print(f"Source jalalayn créée : {source_id}")
        return source_id


def get_surah_names(conn) -> dict[int, str]:
    """Récupère les noms des sourates depuis les textes coraniques déjà ingérés."""
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT DISTINCT (t.metadata->>'surah')::int  AS num,
                            t.metadata->>'surah_name'    AS name
            FROM texts t
            JOIN sources s ON s.id = t.source_id
            WHERE s.collection = 'quran'
              AND t.metadata->>'surah_name' IS NOT NULL
            ORDER BY num
            """
        )
        rows = cur.fetchall()
    return {row[0]: row[1] for row in rows}


def build_entries(verses: list[dict], surah_names: dict[int, str]) -> list[dict]:
    entries = []
    for v in verses:
        chapter = v["chapter"]
        verse = v["verse"]
        text = v.get("text", "").strip()
        if not text:
            continue
        entries.append({
            "reference": f"{chapter}:{verse}",
            "arabic": text,
            "metadata": {
                "surah": str(chapter),
                "ayah": str(verse),
                "surah_name": surah_names.get(chapter, ""),
                "tafsir": "jalalayn",
            },
        })
    return entries


def _flush(cur, batch: list) -> None:
    cur.executemany(
        """
        INSERT INTO texts (source_id, reference, arabic, translation_fr, translation_en, embedding, metadata)
        VALUES (%s, %s, %s, NULL, NULL, %s::vector, %s::jsonb)
        ON CONFLICT DO NOTHING
        """,
        batch,
    )


def ingest(entries: list[dict], source_id: str, conn) -> None:
    print(f"\n{len(entries)} entrées tafsir à ingérer...")

    texts = [e["arabic"] for e in entries]
    print("Génération des embeddings (peut prendre quelques minutes sur CPU)...")
    embeddings = embed_passages(texts)

    with conn.cursor() as cur:
        batch = []
        for entry, emb in tqdm(zip(entries, embeddings), total=len(entries), desc="Insert tafsir"):
            batch.append((
                source_id,
                entry["reference"],
                entry["arabic"],
                emb,
                json.dumps(entry["metadata"], ensure_ascii=False),
            ))

            if len(batch) >= BATCH_SIZE:
                _flush(cur, batch)
                batch = []

        if batch:
            _flush(cur, batch)

    conn.commit()
    print(f"✓ {len(entries)} entrées tafsir ingérées.")


def main() -> None:
    data = fetch_json(JALALAYN_URL)
    verses = data.get("quran", [])
    print(f"✓ {len(verses)} versets récupérés")

    if DRY_RUN:
        print("[DRY RUN] Aperçu :", json.dumps(verses[0], ensure_ascii=False, indent=2))
        print("[DRY RUN] Aucune écriture en base.")
        return

    conn = get_connection()
    try:
        source_id = get_or_create_source(conn)
        surah_names = get_surah_names(conn)
        print(f"✓ {len(surah_names)} noms de sourates chargés depuis la base")

        entries = build_entries(verses, surah_names)
        ingest(entries, source_id, conn)
    finally:
        conn.close()

    print("\n✓ Ingestion du Tafsir al-Jalalayn terminée.")


if __name__ == "__main__":
    main()
