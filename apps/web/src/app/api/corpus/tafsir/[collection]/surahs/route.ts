import { NextRequest, NextResponse } from "next/server"
import tafsirData from "@/data/tafsir_ibn_kathir.json"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection } = await params

  if (collection !== "ibn_kathir") {
    return NextResponse.json({ error: `Tafsir '${collection}' not found` }, { status: 404 })
  }

  const surahMap = new Map<number, { number: number; name_arabic: string; ayah_count: number }>()

  for (const entry of tafsirData) {
    const sNum = parseInt(entry.metadata.surah, 10)
    if (!surahMap.has(sNum)) {
      surahMap.set(sNum, {
        number: sNum,
        name_arabic: entry.metadata.surah_name,
        ayah_count: 0,
      })
    }
    surahMap.get(sNum)!.ayah_count++
  }

  const result = Array.from(surahMap.values()).sort((a, b) => a.number - b.number)
  return NextResponse.json(result)
}
