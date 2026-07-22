import { NextRequest, NextResponse } from "next/server"
import hadithsData from "@/data/hadiths_complete.json"

export async function GET(request: NextRequest, { params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "50", 10)
  const offset = parseInt(searchParams.get("offset") || "0", 10)

  const list = hadithsData.filter((h) => h.collection === collection)

  return NextResponse.json({
    collection,
    label: collection === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim",
    total: list.length,
    limit,
    offset,
    hadiths: list.slice(offset, offset + limit),
  })
}
