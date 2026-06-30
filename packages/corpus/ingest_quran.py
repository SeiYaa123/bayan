"""
Ingestion du Coran depuis tanzil.net (format JSON open-source).

Sources utilisées :
- Texte arabe     : quran-json@3.1.2 (domaine public)
- Traduction EN   : Sahih International via quran-json@3.1.2 (domaine public)
- Traduction FR   : quran-json@3.1.2/quran_fr.json (Hamidullah, domaine public)
                    Fallback : fawazahmed0/quran-api fra-montadasyrian (CC0)

Usage :
    python ingest_quran.py [--dry-run]
"""

import json
import sys
import requests
from tqdm import tqdm
from db import get_connection, get_source_id
from embedder import embed_passages

QURAN_AR_URL  = "https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran.json"
QURAN_EN_URL  = "https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_en.json"
QURAN_FR_URL  = "https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_fr.json"
QURAN_FR_FALLBACK = (
    "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1"
    "/editions/fra-montadasyrian.min.json"
)

BATCH_SIZE = 64
DRY_RUN = "--dry-run" in sys.argv


def fetch_json(url: str) -> dict:
    print(f"Téléchargement : {url}")
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    return r.json()


def fetch_quran_fr() -> dict[str, str]:
    """Retourne {reference: translation_fr}. Essaie la source primaire puis le fallback."""
    try:
        print(f"Téléchargement FR : {QURAN_FR_URL}")
        r = requests.get(QURAN_FR_URL, timeout=30)
        r.raise_for_status()
        data = r.json()
        if isinstance(data, list):
            out: dict[str, str] = {}
            for surah in data:
                s = surah["id"]
                for v in surah.get("verses", []):
                    text = v.get("translation") or v.get("text") or ""
                    if text:
                        out[f"{s}:{v['id']}"] = text
            if out:
                return out
    except Exception as e:
        print(f"  Source FR primaire indisponible ({e}), fallback…")

    print(f"Téléchargement FR fallback : {QURAN_FR_FALLBACK}")
    r = requests.get(QURAN_FR_FALLBACK, timeout=30)
    r.raise_for_status()
    data = r.json()
    out = {}
    for chap in data.get("chapters", []):
        s = chap["chapter"]
        for v in chap.get("verses", []):
            text = v.get("text", "")
            if text:
                out[f"{s}:{v['verse']}"] = text
    return out


def build_ayahs(quran_ar: list, quran_en: list, quran_fr: dict[str, str]) -> list[dict]:
    ayahs = []
    for surah_ar, surah_en in zip(quran_ar, quran_en):
        surah_num = surah_ar["id"]
        surah_name = surah_ar["name"]
        for ayah_ar, ayah_en in zip(surah_ar["verses"], surah_en["verses"]):
            ayah_num = ayah_ar["id"]
            ref = f"{surah_num}:{ayah_num}"
            ayahs.append({
                "reference": ref,
                "arabic": ayah_ar["text"],
                "translation_en": ayah_en.get("translation"),
                "translation_fr": quran_fr.get(ref),
                "metadata": {
                    "surah": str(surah_num),
                    "surah_name": surah_name,
                    "ayah": str(ayah_num),
                },
            })
    return ayahs


def ingest(ayahs: list[dict], source_id: str, conn):
    print(f"\n{len(ayahs)} ayats à ingérer...")

    texts = [a["arabic"] for a in ayahs]
    print("Génération des embeddings...")
    embeddings = embed_passages(texts)

    with conn.cursor() as cur:
        batch = []
        for ayah, emb in tqdm(zip(ayahs, embeddings), total=len(ayahs), desc="Insert"):
            batch.append((
                source_id,
                ayah["reference"],
                ayah["arabic"],
                ayah.get("translation_fr"),
                ayah.get("translation_en"),
                emb,
                json.dumps(ayah["metadata"]),
            ))

            if len(batch) >= BATCH_SIZE:
                _flush(cur, batch)
                batch = []

        if batch:
            _flush(cur, batch)

    conn.commit()
    print(f"✓ {len(ayahs)} ayats ingérés.")


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
    quran_ar = fetch_json(QURAN_AR_URL)
    quran_en = fetch_json(QURAN_EN_URL)
    quran_fr = fetch_quran_fr()
    print(f"Traductions FR disponibles : {len(quran_fr)}/6236")
    ayahs = build_ayahs(quran_ar, quran_en, quran_fr)

    if DRY_RUN:
        print(f"[DRY RUN] {len(ayahs)} ayats seraient ingérés.")
        print("Exemple :", json.dumps(ayahs[0], ensure_ascii=False, indent=2))
        return

    conn = get_connection()
    try:
        source_id = get_source_id(conn, "quran")
        ingest(ayahs, source_id, conn)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
