"""
update_translations.py — Ajoute les traductions FR/EN aux textes déjà ingérés.
Aucun recalcul d'embedding. Uniquement des UPDATE SQL.

Sources (domaine public / CC0) :
  Coran FR   : quran-json@3.1.2 (Hamidullah via npm CDN)
               Fallback : fawazahmed0/quran-api (Montas Syrien)
  Hadith EN  : fawazahmed0/hadith-api editions eng-* (même CDN que l'arabe)

Usage :
    python update_translations.py                   # Coran FR + tous les hadiths EN
    python update_translations.py --quran-only
    python update_translations.py --hadith-only
    python update_translations.py --dry-run
"""

import json
import sys
import requests
from tqdm import tqdm
from db import get_connection, get_source_id

DRY_RUN      = "--dry-run"     in sys.argv
QURAN_ONLY   = "--quran-only"  in sys.argv
HADITH_ONLY  = "--hadith-only" in sys.argv

# ── Sources ──────────────────────────────────────────────────────────────────

QURAN_FR_PRIMARY  = "https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_fr.json"
QURAN_FR_FALLBACK = (
    "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1"
    "/editions/fra-montadasyrian.min.json"
)

HADITH_BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions"

HADITH_EN_EDITIONS = {
    "bukhari":  "eng-bukhari",
    "muslim":   "eng-muslim",
    "abu_dawud":"eng-abudawud",
    "tirmidhi": "eng-tirmidhi",
    "nasai":    "eng-nasai",
    "ibn_majah":"eng-ibnmajah",
}

# fra-tirmidhi is unavailable (403); others confirmed 200
HADITH_FR_EDITIONS = {
    "bukhari":  "fra-bukhari",
    "muslim":   "fra-muslim",
    "abu_dawud":"fra-abudawud",
    "nasai":    "fra-nasai",
    "ibn_majah":"fra-ibnmajah",
}

BATCH_SIZE = 200


def fetch(url: str) -> dict | list:
    print(f"  GET {url}")
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    return r.json()


# ── Coran FR ─────────────────────────────────────────────────────────────────

def _parse_quran_json_format(data: list) -> dict[str, str]:
    """Parse le format quran-json [{id, verses:[{id, translation}]}]."""
    out: dict[str, str] = {}
    for surah in data:
        s = surah["id"]
        for v in surah.get("verses", []):
            ref = f"{s}:{v['id']}"
            text = v.get("translation") or v.get("text") or ""
            if text:
                out[ref] = text
    return out


def _parse_fawazahmed_format(data: dict) -> dict[str, str]:
    """Parse le format fawazahmed0/quran-api {chapters:[{chapter, verses:[{verse, text}]}]}."""
    out: dict[str, str] = {}
    for chap in data.get("chapters", []):
        s = chap["chapter"]
        for v in chap.get("verses", []):
            ref = f"{s}:{v['verse']}"
            text = v.get("text", "")
            if text:
                out[ref] = text
    return out


def fetch_quran_fr() -> dict[str, str]:
    """Retourne {reference: translation_fr} pour les 6 236 ayats."""
    try:
        data = fetch(QURAN_FR_PRIMARY)
        if isinstance(data, list):
            mapping = _parse_quran_json_format(data)
            if mapping:
                print(f"  ✓ {len(mapping)} traductions FR (quran-json)")
                return mapping
    except Exception as e:
        print(f"  Source principale indisponible : {e}")

    print("  → Fallback fawazahmed0/quran-api")
    data = fetch(QURAN_FR_FALLBACK)
    mapping = _parse_fawazahmed_format(data)
    print(f"  ✓ {len(mapping)} traductions FR (fawazahmed0)")
    return mapping


def update_quran_fr(conn) -> None:
    print("\n── Coran : traduction FR ──────────────────────────────────────")
    mapping = fetch_quran_fr()
    if not mapping:
        print("  ✗ Aucune traduction récupérée.")
        return

    source_id = get_source_id(conn, "quran")
    updated = 0

    with conn.cursor() as cur:
        batch_refs  = list(mapping.keys())
        batch_texts = list(mapping.values())

        for i in tqdm(range(0, len(batch_refs), BATCH_SIZE), desc="UPDATE quran FR"):
            chunk_refs  = batch_refs[i:i + BATCH_SIZE]
            chunk_texts = batch_texts[i:i + BATCH_SIZE]

            if DRY_RUN:
                updated += len(chunk_refs)
                continue

            for ref, text in zip(chunk_refs, chunk_texts):
                cur.execute(
                    "UPDATE texts SET translation_fr = %s "
                    "WHERE source_id = %s AND reference = %s AND translation_fr IS NULL",
                    (text, source_id, ref),
                )
                updated += cur.rowcount

    if not DRY_RUN:
        conn.commit()
    print(f"  ✓ {updated} ayats mis à jour (FR){'  [DRY RUN]' if DRY_RUN else ''}")


# ── Hadiths EN ───────────────────────────────────────────────────────────────

def fetch_hadith_en(edition: str) -> dict[str, str]:
    """Retourne {hadithnumber: translation_en} pour une collection."""
    url = f"{HADITH_BASE}/{edition}.min.json"
    try:
        data = fetch(url)
    except Exception:
        # Essayer sans .min
        url = f"{HADITH_BASE}/{edition}.json"
        data = fetch(url)

    hadiths = data.get("hadiths", [])
    out: dict[str, str] = {}
    for h in hadiths:
        num = str(h.get("hadithnumber", h.get("id", "")))
        text = h.get("text", "").strip()
        if num and text:
            out[num] = text
    return out


def _update_hadith_lang(conn, collection: str, edition: str, lang: str) -> None:
    col = "translation_fr" if lang == "fr" else "translation_en"
    label = lang.upper()
    print(f"\n── Hadith {collection} : traduction {label} ──────────────────────────")
    try:
        mapping = fetch_hadith_en(edition)
    except Exception as e:
        print(f"  ✗ Impossible de récupérer {edition} : {e}")
        return

    if not mapping:
        print("  ✗ Aucune traduction récupérée.")
        return

    print(f"  {len(mapping)} hadiths {label} récupérés")

    try:
        source_id = get_source_id(conn, collection)
    except ValueError as e:
        print(f"  ✗ {e}")
        return

    updated = 0
    items = list(mapping.items())

    with conn.cursor() as cur:
        for i in tqdm(range(0, len(items), BATCH_SIZE), desc=f"UPDATE {collection} {label}"):
            chunk = items[i:i + BATCH_SIZE]
            if DRY_RUN:
                updated += len(chunk)
                continue
            for num, text in chunk:
                ref = f"{collection}:{num}"
                cur.execute(
                    f"UPDATE texts SET {col} = %s "
                    f"WHERE source_id = %s AND reference = %s AND {col} IS NULL",
                    (text, source_id, ref),
                )
                updated += cur.rowcount

    if not DRY_RUN:
        conn.commit()
    print(f"  ✓ {updated} hadiths mis à jour ({label}){'  [DRY RUN]' if DRY_RUN else ''}")


def update_hadith_en(conn, collection: str, edition: str) -> None:
    _update_hadith_lang(conn, collection, edition, "en")


def update_hadith_fr(conn, collection: str, edition: str) -> None:
    _update_hadith_lang(conn, collection, edition, "fr")


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    if DRY_RUN:
        print("[DRY RUN] Aucune écriture en base.\n")

    conn = get_connection()
    try:
        if not HADITH_ONLY:
            update_quran_fr(conn)

        if not QURAN_ONLY:
            for collection, edition in HADITH_FR_EDITIONS.items():
                update_hadith_fr(conn, collection, edition)
            for collection, edition in HADITH_EN_EDITIONS.items():
                update_hadith_en(conn, collection, edition)
    finally:
        conn.close()

    print("\n✓ Mise à jour des traductions terminée.")


if __name__ == "__main__":
    main()
