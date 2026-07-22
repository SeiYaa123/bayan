import { NextRequest, NextResponse } from "next/server"
import surahsData from "@/data/quran_surahs.json"

export async function GET(request: NextRequest, { params }: { params: Promise<{ surah: string }> }) {
  const { surah: surahStr } = await params
  const surahNum = parseInt(surahStr, 10)

  const found = surahsData.find((s) => s.number === surahNum)

  if (!found) {
    return NextResponse.json({ error: `Surah ${surahNum} not found` }, { status: 404 })
  }

  return NextResponse.json({
    surah: found.number,
    surah_name: found.name_arabic,
    ayah_count: found.ayah_count,
    ayahs: found.ayahs,
  })
}
