"""
Ingestion des hadiths depuis le dataset open-source hadith-json.

Source : github.com/fawazahmed0/hadith-api (domaine public, CC0)
Collections disponibles : bukhari, muslim, abudawud, tirmidhi, nasai, ibnmajah

Usage :
    python ingest_hadith.py --collection bukhari [--dry-run]
"""

import json
import sys
import requests
from tqdm import tqdm
from db import get_connection, get_source_id
from embedder import embed_passages

BASE_URL = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions"

COLLECTION_MAP = {
    "bukhari":  ("ara-bukhari",  "eng-bukhari",  "bukhari"),
    "muslim":   ("ara-muslim",   "eng-muslim",   "muslim"),
    "abu_dawud":("ara-abudawud", "eng-abudawud", "abu_dawud"),
    "tirmidhi": ("ara-tirmidhi", "eng-tirmidhi", "tirmidhi"),
    "nasai":    ("ara-nasai",    "eng-nasai",    "nasai"),
    "ibn_majah":("ara-ibnmajah", "eng-ibnmajah", "ibn_majah"),
}

BATCH_SIZE = 64
DRY_RUN = "--dry-run" in sys.argv
COLLECTION_ARG = next((a for a in sys.argv[1:] if not a.startswith("--")), "bukhari")


def fetch_collection(edition: str) -> list[dict]:
    for url in [f"{BASE_URL}/{edition}.min.json", f"{BASE_URL}/{edition}.json"]:
        try:
            print(f"Téléchargement : {url}")
            r = requests.get(url, timeout=60)
            r.raise_for_status()
            return r.json().get("hadiths", [])
        except Exception:
            continue
    raise RuntimeError(f"Impossible de télécharger {edition}")


def build_records(
    hadiths_ar: list[dict],
    hadiths_en: list[dict],
    collection_key: str,
) -> list[dict]:
    en_index: dict[str, str] = {
        str(h.get("hadithnumber", h.get("id", ""))): h.get("text", "").strip()
        for h in hadiths_en
    }
    records = []
    for h in hadiths_ar:
        hadith_num = h.get("hadithnumber", h.get("id", "?"))
        arabic = h.get("text", "").strip()
        if not arabic:
            continue
        records.append({
            "reference": f"{collection_key}:{hadith_num}",
            "arabic": arabic,
            "translation_fr": None,
            "translation_en": en_index.get(str(hadith_num)) or None,
            "metadata": {
                "collection": collection_key,
                "number": str(hadith_num),
                "grades": h.get("grades", []),
            },
        })
    return records


def ingest(records: list[dict], source_id: str, conn):
    print(f"\n{len(records)} hadiths à ingérer...")
    texts = [r["arabic"] for r in records]
    print("Génération des embeddings...")
    embeddings = embed_passages(texts)

    with conn.cursor() as cur:
        batch = []
        for record, emb in tqdm(zip(records, embeddings), total=len(records), desc="Insert"):
            batch.append((
                source_id,
                record["reference"],
                record["arabic"],
                record.get("translation_fr"),
                record.get("translation_en"),
                emb,
                json.dumps(record["metadata"]),
            ))
            if len(batch) >= BATCH_SIZE:
                _flush(cur, batch)
                batch = []
        if batch:
            _flush(cur, batch)

    conn.commit()
    print(f"✓ {len(records)} hadiths ingérés.")


def _flush(cur, batch: list):
    cur.executemany(
        """
        INSERT INTO texts (source_id, reference, arabic, translation_fr, translation_en, embedding, metadata)
        VALUES (%s, %s, %s, %s, %s, %s::vector, %s::jsonb)
        ON CONFLICT DO NOTHING
        """,
        batch,
    )


def main():
    if COLLECTION_ARG not in COLLECTION_MAP:
        print(f"Collection inconnue : {COLLECTION_ARG}")
        print(f"Collections disponibles : {', '.join(COLLECTION_MAP)}")
        sys.exit(1)

    edition_ar, edition_en, db_collection = COLLECTION_MAP[COLLECTION_ARG]
    hadiths_ar = fetch_collection(edition_ar)
    try:
        hadiths_en = fetch_collection(edition_en)
        print(f"Traductions EN : {len(hadiths_en)} hadiths")
    except Exception as e:
        print(f"Traduction EN indisponible ({e}), ingestion arabe seule.")
        hadiths_en = []
    records = build_records(hadiths_ar, hadiths_en, db_collection)

    if DRY_RUN:
        print(f"[DRY RUN] {len(records)} hadiths seraient ingérés pour '{db_collection}'.")
        if records:
            print("Exemple :", json.dumps(records[0], ensure_ascii=False, indent=2))
        return

    conn = get_connection()
    try:
        source_id = get_source_id(conn, db_collection)
        ingest(records, source_id, conn)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
