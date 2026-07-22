import { NextResponse } from "next/server"

const HADITH_COLLECTIONS = [
  { collection: "bukhari", label: "Sahih al-Bukhari", total: 7563, has_en: 7563 },
  { collection: "muslim", label: "Sahih Muslim", total: 7470, has_en: 7470 },
  { collection: "abudawud", label: "Sunan Abu Dawud", total: 5274, has_en: 5274 },
  { collection: "tirmidhi", label: "Jami` at-Tirmidhi", total: 3956, has_en: 3956 },
  { collection: "nasai", label: "Sunan an-Nasa'i", total: 5758, has_en: 5758 },
  { collection: "ibnmajah", label: "Sunan Ibn Majah", total: 4341, has_en: 4341 }
]

export async function GET() {
  return NextResponse.json(HADITH_COLLECTIONS)
}
