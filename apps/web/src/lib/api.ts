const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ""



async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), 15000) // 15s timeout to handle Vercel cold starts
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(id)
    return res
  } catch (err) {
    clearTimeout(id)
    throw err
  }
}

export const normalizeText = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export interface SearchResult {
  id: string
  reference: string
  arabic: string
  translation_fr: string | null
  translation_en: string | null
  source_type: "quran" | "hadith" | "tafsir"
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
  // CLIENT-SIDE: Always fetch relative API route to prevent massive client bundle size
  if (typeof window !== "undefined") {
    const params = new URLSearchParams({ q: query, limit: String(limit), offset: String(offset) })
    types.forEach((t) => params.append("types", t))

    const res = await fetchWithTimeout(`/api/search?${params}`)
    if (!res.ok) throw new Error(`Search failed: ${res.statusText}`)
    return res.json()
  }

  // SERVER-SIDE fallback (during SSR or static prerendering)
  const allAyahs = (await import("@/data/quran_all_ayahs.json")).default
  const hadithsData = (await import("@/data/hadiths_complete.json")).default
  const tafsirData = (await import("@/data/tafsir_ibn_kathir.json")).default

  let dataset: SearchResult[] = [
    ...allAyahs.map((a) => ({
      ...a,
      source_type: "quran" as const,
      score: 0.9,
      match_type: "hybrid" as const,
    })),
    ...hadithsData.map((h) => ({
      ...h,
      source_type: "hadith" as const,
      score: 0.95,
      match_type: "hybrid" as const,
    })),
    ...tafsirData.map((t) => ({
      ...t,
      source_type: "tafsir" as const,
      score: 0.92,
      match_type: "hybrid" as const,
    })),
  ]

  if (types.length > 0) {
    dataset = dataset.filter((item) => types.includes(item.source_type))
  }

  let filtered = dataset

  if (query.trim()) {
    const qNorm = normalizeText(query)
    filtered = dataset.filter(
      (item) =>
        (item.arabic && item.arabic.includes(query)) ||
        (item.translation_fr && normalizeText(item.translation_fr).includes(qNorm)) ||
        (item.translation_en && normalizeText(item.translation_en).includes(qNorm)) ||
        (item.reference && normalizeText(item.reference).includes(qNorm))
    )
  }

  const paginated = filtered.slice(offset, offset + limit)

  return {
    results: paginated,
    total: filtered.length,
    query,
  }
}

export async function getTextWithConnections(id: string) {
  const res = await fetchWithTimeout(`${API_URL}/api/texts/${id}`)
  if (!res.ok) throw new Error(`Text not found: ${id}`)
  return res.json()
}

export async function getAyah(surah: number, ayah: number) {
  const res = await fetchWithTimeout(`${API_URL}/api/texts/quran/${surah}/${ayah}`)
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
  const res = await fetchWithTimeout(`${API_URL}/api/isnad/${hadithId}`)
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
  if (typeof window === "undefined" || !API_URL) {
    const surahsData = (await import("@/data/quran_surahs.json")).default
    return surahsData.map((s) => ({
      number: s.number,
      name_arabic: s.name_arabic,
      ayah_count: s.ayah_count,
    }))
  }
  const res = await fetchWithTimeout(`${API_URL}/api/corpus/quran/surahs`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error("Failed to fetch surahs")
  return res.json()
}

export async function getQuranSurah(surah: number): Promise<SurahDetail> {
  if (typeof window === "undefined" || !API_URL) {
    const surahsData = (await import("@/data/quran_surahs.json")).default
    const found = surahsData.find((s) => s.number === surah)
    if (!found) throw new Error(`Surah ${surah} not found`)
    return {
      surah: found.number,
      surah_name: found.name_arabic,
      ayah_count: found.ayah_count,
      ayahs: found.ayahs,
    }
  }
  const res = await fetchWithTimeout(`${API_URL}/api/corpus/quran/${surah}`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Surah ${surah} not found`)
  return res.json()
}

export async function getHadithCollections(): Promise<HadithCollection[]> {
  if (typeof window === "undefined" || !API_URL) {
    return [
      { collection: "bukhari", label: "Sahih al-Bukhari", total: 150, has_en: 150 },
      { collection: "muslim", label: "Sahih Muslim", total: 150, has_en: 150 },
    ]
  }
  const res = await fetchWithTimeout(`${API_URL}/api/corpus/hadith`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error("Failed to fetch hadith collections")
  return res.json()
}

export async function getHadithCollection(
  collection: string,
  limit = 50,
  offset = 0,
): Promise<HadithCollectionDetail> {
  if (typeof window === "undefined" || !API_URL) {
    const hadithsData = (await import("@/data/hadiths_complete.json")).default
    const list = hadithsData.filter((h) => h.collection === collection)
    return {
      collection,
      label: collection === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim",
      total: list.length,
      limit,
      offset,
      hadiths: list.slice(offset, offset + limit) as any[],
    }
  }
  const res = await fetchWithTimeout(
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
  if (typeof window === "undefined" || !API_URL) {
    const tafsirData = (await import("@/data/tafsir_ibn_kathir.json")).default
    return [
      { collection: "ibn_kathir", label: "Tafsir Ibn Kathir", total: tafsirData.length },
    ]
  }
  const res = await fetchWithTimeout(`${API_URL}/api/corpus/tafsir`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error("Failed to fetch tafsir collections")
  return res.json()
}

export async function getTafsirSurahs(collection: string): Promise<{ number: number; name_arabic: string; ayah_count: number }[]> {
  if (typeof window === "undefined" || !API_URL) {
    if (collection !== "ibn_kathir") return []
    const tafsirData = (await import("@/data/tafsir_ibn_kathir.json")).default
    const surahMap = new Map<number, { number: number; name_arabic: string; ayah_count: number }>()
    for (const entry of tafsirData) {
      if (entry.collection !== collection) continue
      const sNum = parseInt(entry.metadata.surah, 10)
      if (!surahMap.has(sNum)) {
        surahMap.set(sNum, {
          number: sNum,
          name_arabic: entry.metadata.surah_name,
          ayah_count: 0
        })
      }
      surahMap.get(sNum)!.ayah_count++
    }
    return Array.from(surahMap.values()).sort((a, b) => a.number - b.number)
  }
  const res = await fetchWithTimeout(`${API_URL}/api/corpus/tafsir/${collection}/surahs`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Tafsir ${collection} not found`)
  return res.json()
}

export async function getTafsirSurah(collection: string, surah: number): Promise<TafsirSurahDetail> {
  if (typeof window === "undefined" || !API_URL) {
    const tafsirData = (await import("@/data/tafsir_ibn_kathir.json")).default
    const entries = tafsirData.filter(
      (entry) => entry.collection === collection && parseInt(entry.metadata.surah, 10) === surah
    )
    if (entries.length === 0) throw new Error(`Tafsir ${collection} surah ${surah} not found`)
    return {
      collection,
      label: collection === "ibn_kathir" ? "Tafsir Ibn Kathir" : collection,
      surah,
      surah_name: entries[0].metadata.surah_name,
      ayah_count: entries.length,
      entries: entries.map(e => ({
        id: e.id,
        reference: e.reference,
        arabic: e.arabic,
        translation_fr: e.translation_fr,
        translation_en: e.translation_en,
        metadata: e.metadata as any
      }))
    }
  }
  const res = await fetchWithTimeout(`${API_URL}/api/corpus/tafsir/${collection}/${surah}`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Tafsir ${collection} surah ${surah} not found`)
  return res.json()
}
