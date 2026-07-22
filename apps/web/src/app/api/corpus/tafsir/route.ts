import { NextRequest, NextResponse } from "next/server"
import tafsirData from "@/data/tafsir_ibn_kathir.json"

export async function GET(request: NextRequest) {
  return NextResponse.json([
    {
      collection: "ibn_kathir",
      label: "Tafsir Ibn Kathir",
      total: tafsirData.length,
    },
  ])
}
