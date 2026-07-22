import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Dynamic imports to prevent bundling in client
    const allAyahsModule = await import("@/data/quran_all_ayahs.json")
    const hadithsDataModule = await import("@/data/hadiths_complete.json")
    
    const allAyahs = allAyahsModule.default
    const hadithsData = hadithsDataModule.default

    const today = new Date()
    const start = new Date(today.getFullYear(), 0, 0)
    const diff = today.getTime() - start.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    const dayOfYear = Math.floor(diff / oneDay)

    // Select based on day of year seed
    const ayahIndex = dayOfYear % allAyahs.length
    const hadithIndex = dayOfYear % hadithsData.length

    const ayah = allAyahs[ayahIndex]
    const hadith = hadithsData[hadithIndex]

    return NextResponse.json({
      success: true,
      dayOfYear,
      ayah: {
        id: ayah.id,
        reference: ayah.reference,
        arabic: ayah.arabic,
        translation_fr: ayah.translation_fr,
        surah_name: ayah.metadata.surah_name,
        surah_num: ayah.metadata.surah
      },
      hadith: {
        id: hadith.id,
        reference: `${hadith.collection} ${hadith.reference}`,
        collection: hadith.collection,
        arabic: hadith.arabic,
        translation_fr: hadith.translation_fr ?? hadith.translation_en
      }
    })
  } catch (e) {
    console.error("Failed to load daily texts:", e)
    return NextResponse.json(
      { success: false, error: "Failed to load daily content" },
      { status: 500 }
    )
  }
}
