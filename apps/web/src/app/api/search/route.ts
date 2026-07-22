import { NextRequest, NextResponse } from "next/server"
import allAyahs from "@/data/quran_all_ayahs.json"
import hadithsData from "@/data/hadiths_complete.json"
import tafsirData from "@/data/tafsir_ibn_kathir.json"
import { normalizeText } from "@/lib/api"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || ""
  const limit = parseInt(searchParams.get("limit") || "20", 10)
  const offset = parseInt(searchParams.get("offset") || "0", 10)
  const types = searchParams.getAll("types")

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
    filtered = dataset.filter(
      (item) =>
        (item.arabic && item.arabic.includes(q)) ||
        (item.translation_fr && normalizeText(item.translation_fr).includes(qNorm)) ||
        (item.translation_en && normalizeText(item.translation_en).includes(qNorm)) ||
        (item.reference && normalizeText(item.reference).includes(qNorm))
    )
  }

  const paginated = filtered.slice(offset, offset + limit)

  return NextResponse.json({
    results: paginated,
    total: filtered.length,
    query: q,
  })
}
