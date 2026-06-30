const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export interface SearchResult {
  id: string
  reference: string
  arabic: string
  translation_fr: string | null
  translation_en: string | null
  source_type: "quran" | "hadith" | "tafsir" | "fiqh"
  collection: string
  score: number
  match_type: "semantic" | "keyword" | "hybrid"
  metadata: Record<string, unknown>
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
}

export interface Connection {
  id: string
  reference: string
  arabic: string
  translation_fr: string | null
  source_type: string
  collection: string
  ref_type: string
  confidence: number
}

export async function search(
  query: string,
  types: string[] = [],
  limit = 20,
  offset = 0,
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query, limit: String(limit), offset: String(offset) })
  types.forEach((t) => params.append("types", t))

  const res = await fetch(`${API_URL}/api/search?${params}`)
  if (!res.ok) throw new Error(`Search failed: ${res.statusText}`)
  return res.json()
}

export async function getTextWithConnections(id: string) {
  const res = await fetch(`${API_URL}/api/texts/${id}`)
  if (!res.ok) throw new Error(`Text not found: ${id}`)
  return res.json()
}

export async function getAyah(surah: number, ayah: number) {
  const res = await fetch(`${API_URL}/api/texts/quran/${surah}/${ayah}`)
  if (!res.ok) throw new Error(`Ayah ${surah}:${ayah} not found`)
  return res.json()
}

export interface NarratorNode {
  id: string
  name_arabic: string
  name_transliterated: string | null
  death_year: number | null
  reliability: string | null
  position: number
  transmission_type: string | null
}

export interface IsnadChainData {
  hadith_id: string
  hadith_reference: string
  chain: NarratorNode[]
  chain_length: number
  weakest_link: string | null
  overall_grade: string
}

export async function getIsnad(hadithId: string): Promise<IsnadChainData | null> {
  const res = await fetch(`${API_URL}/api/isnad/${hadithId}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Isnad fetch failed: ${res.statusText}`)
  return res.json()
}

// ── Corpus browsing ──────────────────────────────────────────────────────────

export interface SurahMeta {
  number: number
  name_arabic: string
  ayah_count: number
}

export interface Ayah {
  id: string
  reference: string
  arabic: string
  translation_fr: string | null
  translation_en: string | null
  metadata: { surah: string; surah_name: string; ayah: string }
}

export interface SurahDetail {
  surah: number
  surah_name: string
  ayah_count: number
  ayahs: Ayah[]
}

export interface HadithCollection {
  collection: string
  label: string
  total: number
  has_en: number
}

export interface Hadith {
  id: string
  reference: string
  arabic: string
  translation_fr: string | null
  translation_en: string | null
  metadata: { collection: string; number: string; grades: unknown[] }
}

export interface HadithCollectionDetail {
  collection: string
  label: string
  total: number
  limit: number
  offset: number
  hadiths: Hadith[]
}

export async function getQuranSurahs(): Promise<SurahMeta[]> {
  const res = await fetch(`${API_URL}/api/corpus/quran/surahs`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error("Failed to fetch surahs")
  return res.json()
}

export async function getQuranSurah(surah: number): Promise<SurahDetail> {
  const res = await fetch(`${API_URL}/api/corpus/quran/${surah}`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Surah ${surah} not found`)
  return res.json()
}

export async function getHadithCollections(): Promise<HadithCollection[]> {
  const res = await fetch(`${API_URL}/api/corpus/hadith`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error("Failed to fetch hadith collections")
  return res.json()
}

export async function getHadithCollection(
  collection: string,
  limit = 50,
  offset = 0,
): Promise<HadithCollectionDetail> {
  const res = await fetch(
    `${API_URL}/api/corpus/hadith/${collection}?limit=${limit}&offset=${offset}`,
    { next: { revalidate: 60 } },
  )
  if (!res.ok) throw new Error(`Collection ${collection} not found`)
  return res.json()
}

// ── Tafsir ───────────────────────────────────────────────────────────────────

export interface TafsirCollection {
  collection: string
  label: string
  total: number
}

export interface TafsirEntry {
  id: string
  reference: string
  arabic: string
  translation_fr: string | null
  translation_en: string | null
  metadata: { surah: string; ayah: string; surah_name: string; tafsir: string }
}

export interface TafsirSurahDetail {
  collection: string
  label: string
  surah: number
  surah_name: string
  ayah_count: number
  entries: TafsirEntry[]
}

export async function getTafsirCollections(): Promise<TafsirCollection[]> {
  const res = await fetch(`${API_URL}/api/corpus/tafsir`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error("Failed to fetch tafsir collections")
  return res.json()
}

export async function getTafsirSurahs(collection: string): Promise<{ number: number; name_arabic: string; ayah_count: number }[]> {
  const res = await fetch(`${API_URL}/api/corpus/tafsir/${collection}/surahs`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Tafsir ${collection} not found`)
  return res.json()
}

export async function getTafsirSurah(collection: string, surah: number): Promise<TafsirSurahDetail> {
  const res = await fetch(`${API_URL}/api/corpus/tafsir/${collection}/${surah}`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Tafsir ${collection} surah ${surah} not found`)
  return res.json()
}
