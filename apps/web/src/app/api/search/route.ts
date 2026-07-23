import { NextRequest, NextResponse } from "next/server"
import allAyahs from "@/data/quran_all_ayahs.json"
import hadithsData from "@/data/hadiths_complete.json"
import tafsirData from "@/data/tafsir_ibn_kathir.json"
import { normalizeText, normalizeArabic } from "@/lib/api"

// Simple in-memory cache for search queries (limit to 500 entries)
const searchCache = new Map<string, any>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || ""
  const limit = parseInt(searchParams.get("limit") || "20", 10)
  const offset = parseInt(searchParams.get("offset") || "0", 10)
  const types = searchParams.getAll("types")

  // Generate cache key
  const cacheKey = `${q}:${limit}:${offset}:${types.sort().join(",")}`
  if (searchCache.has(cacheKey)) {
    return NextResponse.json(searchCache.get(cacheKey))
  }

  // Combine all datasets
  let dataset = [
    ...allAyahs.map((a) => ({
      ...a,
      score: 0.9,
      match_type: "hybrid" as const,
    })),
    ...hadithsData.map((h) => ({
      ...h,
      score: 0.95,
      match_type: "hybrid" as const,
    })),
    ...tafsirData.map((t) => ({
      ...t,
      score: 0.92,
      match_type: "hybrid" as const,
    }))
  ]

  if (types.length > 0) {
    dataset = dataset.filter((item) => types.includes(item.source_type))
  }

  let filtered = dataset

  if (q.trim()) {
    const qNorm = normalizeText(q)
    const qArabic = normalizeArabic(q)
    const containsArabic = /[\u0600-\u06FF]/.test(q)

    filtered = dataset.filter(
      (item) =>
        (item.arabic && (containsArabic ? normalizeArabic(item.arabic).includes(qArabic) : item.arabic.includes(q))) ||
        (item.translation_fr && normalizeText(item.translation_fr).includes(qNorm)) ||
        (item.translation_en && normalizeText(item.translation_en).includes(qNorm)) ||
        (item.reference && normalizeText(item.reference).includes(qNorm))
    )
  }

  const paginated = filtered.slice(offset, offset + limit)

  const responseData = {
    results: paginated,
    total: filtered.length,
    query: q,
  }

  // Prevent memory leaks by capping the cache size
  if (searchCache.size > 500) {
    searchCache.clear()
  }
  searchCache.set(cacheKey, responseData)

  return NextResponse.json(responseData)
}
