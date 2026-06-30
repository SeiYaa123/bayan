"""
ingest_ibn_kathir.py — Ingestion du Tafsir Ibn Kathir (anglais) dans la base.

Source : mrikhan1/iqra-tafsir-data (GitHub, accès libre)
  114 fichiers surah_NNN.json — format {verse: {"en": "...", "ur": "..."}}

Stratégie :
  - arabic      : verset coranique correspondant (déjà en base, source quran)
  - translation_en : commentaire Ibn Kathir en anglais
  - embedding   : généré sur le texte anglais (contenu principal)

Résultat attendu : 6 236 entrées dans la table texts.

Usage :
    python ingest_ibn_kathir.py              # ingestion complète
    python ingest_ibn_kathir.py --dry-run   # aperçu sans écriture
"""

import json
import sys
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
from db import get_connection, get_source_id
from embedder import embed_passages

BASE_URL = "https://raw.githubusercontent.com/mrikhan1/iqra-tafsir-data/main/surah_{:03d}.json"
BATCH_SIZE = 64
DRY_RUN = "--dry-run" in sys.argv


def fetch_surah(surah_num: int) -> dict[str, dict]:
    url = BASE_URL.format(surah_num)
    for attempt in range(3):
        try:
            r = requests.get(url, timeout=30)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            if attempt == 2:
                raise
            time.sleep(2 ** attempt)
    return {}


def fetch_all_surahs() -> dict[int, dict[str, dict]]:
    print("Téléchargement des 114 sourates Ibn Kathir (parallèle)...")
    results: dict[int, dict] = {}

    with ThreadPoolExecutor(max_workers=10) as pool:
        futures = {pool.submit(fetch_surah, s): s for s in range(1, 115)}
        for fut in tqdm(as_completed(futures), total=114, desc="Fetch"):
            s = futures[fut]
            try:
                results[s] = fut.result()
            except Exception as e:
                print(f"  ✗ Sourate {s} impossible à récupérer : {e}")
                results[s] = {}

    fetched = sum(1 for v in results.values() if v)
    print(f"✓ {fetched}/114 sourates récupérées")
    return results


def get_quran_arabic(conn) -> dict[str, str]:
    """Retourne {reference: arabic_text} pour les 6 236 ayats coraniques."""
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT t.reference, t.arabic
            FROM texts t
            JOIN sources s ON s.id = t.source_id
            WHERE s.collection = 'quran'
            """
        )
        return {row[0]: row[1] for row in cur.fetchall()}


def get_surah_names(conn) -> dict[int, str]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT DISTINCT (t.metadata->>'surah')::int AS num,
                            t.metadata->>'surah_name'   AS name
            FROM texts t
            JOIN sources s ON s.id = t.source_id
            WHERE s.collection = 'quran'
              AND t.metadata->>'surah_name' IS NOT NULL
            ORDER BY num
            """
        )
        return {row[0]: row[1] for row in cur.fetchall()}


def build_entries(
    surahs: dict[int, dict],
    quran_arabic: dict[str, str],
    surah_names: dict[int, str],
) -> list[dict]:
    entries = []
    for surah_num in range(1, 115):
        verses = surahs.get(surah_num, {})
        for verse_str, content in verses.items():
            if not isinstance(content, dict):
                continue
            en_text = content.get("en", "").strip()
            if not en_text:
                continue

            ref = f"{surah_num}:{verse_str}"
            arabic = quran_arabic.get(ref, "")

            entries.append({
                "reference": ref,
                "arabic": arabic,
                "translation_en": en_text,
                "metadata": {
                    "surah": str(surah_num),
                    "ayah": verse_str,
                    "surah_name": surah_names.get(surah_num, ""),
                    "tafsir": "ibn_kathir",
                },
            })
    return entries


def _flush(cur, batch: list) -> None:
    cur.executemany(
        """
        INSERT INTO texts (source_id, reference, arabic, translation_fr, translation_en, embedding, metadata)
        VALUES (%s, %s, %s, NULL, %s, %s::vector, %s::jsonb)
        ON CONFLICT DO NOTHING
        """,
        batch,
    )


def ingest(entries: list[dict], source_id: str, conn) -> None:
    print(f"\n{len(entries)} entrées Ibn Kathir à ingérer...")

    # Embed the English commentary (most useful for search)
    english_texts = [e["translation_en"] for e in entries]
    print("Génération des embeddings sur le texte anglais...")
    embeddings = embed_passages(english_texts)

    with conn.cursor() as cur:
        batch = []
        for entry, emb in tqdm(zip(entries, embeddings), total=len(entries), desc="Insert ibn_kathir"):
            batch.append((
                source_id,
                entry["reference"],
                entry["arabic"],
                entry["translation_en"],
                emb,
                json.dumps(entry["metadata"], ensure_ascii=False),
            ))

            if len(batch) >= BATCH_SIZE:
                _flush(cur, batch)
                batch = []

        if batch:
            _flush(cur, batch)

    conn.commit()
    print(f"✓ {len(entries)} entrées Ibn Kathir ingérées.")


def main() -> None:
    surahs = fetch_all_surahs()

    if DRY_RUN:
        # Show sample entry
        sample_surah = surahs.get(1, {})
        sample_verse = list(sample_surah.values())[0] if sample_surah else {}
        print("[DRY RUN] Exemple :", json.dumps(sample_verse, ensure_ascii=False, indent=2)[:500])
        total = sum(len(v) for v in surahs.values())
        print(f"[DRY RUN] {total} entrées seraient ingérées. Aucune écriture.")
        return

    conn = get_connection()
    try:
        source_id = get_source_id(conn, "ibn_kathir")
        print(f"Source ibn_kathir : {source_id}")

        quran_arabic = get_quran_arabic(conn)
        print(f"✓ {len(quran_arabic)} versets arabes chargés depuis la base")

        surah_names = get_surah_names(conn)
        print(f"✓ {len(surah_names)} noms de sourates chargés")

        entries = build_entries(surahs, quran_arabic, surah_names)
        print(f"✓ {len(entries)} entrées construites")

        ingest(entries, source_id, conn)
    finally:
        conn.close()

    print("\n✓ Ingestion du Tafsir Ibn Kathir terminée.")


if __name__ == "__main__":
    main()
