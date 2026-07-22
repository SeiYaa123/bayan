import { NextResponse } from "next/server"
import surahsData from "@/data/quran_surahs.json"

export async function GET() {
  const summary = surahsData.map((s) => ({
    number: s.number,
    name_arabic: s.name_arabic,
    ayah_count: s.ayah_count,
  }))
  return NextResponse.json(summary)
}
