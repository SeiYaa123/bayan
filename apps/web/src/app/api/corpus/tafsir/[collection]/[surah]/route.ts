import { NextRequest, NextResponse } from "next/server"
import tafsirData from "@/data/tafsir_ibn_kathir.json"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; surah: string }> }
) {
  const { collection, surah: surahStr } = await params
  const surahNum = parseInt(surahStr, 10)

  if (collection !== "ibn_kathir") {
    return NextResponse.json({ error: `Tafsir '${collection}' not found` }, { status: 404 })
  }

  const entries = tafsirData.filter(
    (entry) => entry.collection === collection && parseInt(entry.metadata.surah, 10) === surahNum
  )

  if (entries.length === 0) {
    return NextResponse.json({ error: `Tafsir surah ${surahNum} not found` }, { status: 404 })
  }

  return NextResponse.json({
    collection,
    label: "Tafsir Ibn Kathir",
    surah: surahNum,
    surah_name: entries[0].metadata.surah_name,
    ayah_count: entries.length,
    entries: entries.map((e) => ({
      id: e.id,
      reference: e.reference,
      arabic: e.arabic,
      translation_fr: e.translation_fr,
      translation_en: e.translation_en,
      metadata: e.metadata,
    })),
  })
}
