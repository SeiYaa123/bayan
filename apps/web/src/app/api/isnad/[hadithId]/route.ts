import { NextRequest, NextResponse } from "next/server"

// Canon transmission chains for mock hadiths
const ISNAD_DATABASE: Record<string, any> = {
  "hadith-bukhari-1": {
    hadith_id: "hadith-bukhari-1",
    hadith_reference: "bukhari:1",
    chain: [
      {
        id: "narrator-b1-1",
        name_arabic: "الحميدي عبد الله بن الزبير",
        name_transliterated: "Al-Humaydi Abdullah ibn al-Zubayr",
        death_year: 219,
        reliability: "thiqah",
        position: 1,
        transmission_type: "حدثنا"
      },
      {
        id: "narrator-b1-2",
        name_arabic: "سفيان بن عيينة",
        name_transliterated: "Sufyan ibn 'Uyaynah",
        death_year: 198,
        reliability: "thiqah",
        position: 2,
        transmission_type: "حدثنا"
      },
      {
        id: "narrator-b1-3",
        name_arabic: "يحيى بن سعيد الأنصاري",
        name_transliterated: "Yahya ibn Sa'id al-Ansari",
        death_year: 143,
        reliability: "thiqah",
        position: 3,
        transmission_type: "حدثنا"
      },
      {
        id: "narrator-b1-4",
        name_arabic: "محمد بن إبراهيم التيمي",
        name_transliterated: "Muhammad ibn Ibrahim al-Taymi",
        death_year: 120,
        reliability: "thiqah",
        position: 4,
        transmission_type: "أخبرني"
      },
      {
        id: "narrator-b1-5",
        name_arabic: "علقمة بن وقاص الليثي",
        name_transliterated: "Alqamah ibn Waqqas al-Laythi",
        death_year: 85,
        reliability: "thiqah",
        position: 5,
        transmission_type: "سمعت"
      },
      {
        id: "narrator-b1-6",
        name_arabic: "عمر بن الخطاب",
        name_transliterated: "Umar ibn al-Khattab",
        death_year: 23,
        reliability: "sahabi",
        position: 6,
        transmission_type: "سمعت"
      }
    ],
    chain_length: 6,
    weakest_link: null,
    overall_grade: "sahih"
  },
  "hadith-bukhari-2": {
    hadith_id: "hadith-bukhari-2",
    hadith_reference: "bukhari:2",
    chain: [
      {
        id: "narrator-b2-1",
        name_arabic: "عبد الله بن يوسف التنيسي",
        name_transliterated: "Abdullah ibn Yusuf al-Tunisi",
        death_year: 218,
        reliability: "thiqah",
        position: 1,
        transmission_type: "أخبرنا"
      },
      {
        id: "narrator-b2-2",
        name_arabic: "مالك بن أنس",
        name_transliterated: "Malik ibn Anas",
        death_year: 179,
        reliability: "thiqah",
        position: 2,
        transmission_type: "عن"
      },
      {
        id: "narrator-b2-3",
        name_arabic: "هشام بن عروة",
        name_transliterated: "Hisham ibn 'Urwah",
        death_year: 146,
        reliability: "thiqah",
        position: 3,
        transmission_type: "عan"
      },
      {
        id: "narrator-b2-4",
        name_arabic: "عروة بن الزبير",
        name_transliterated: "Urwah ibn al-Zubayr",
        death_year: 94,
        reliability: "thiqah",
        position: 4,
        transmission_type: "عن"
      },
      {
        id: "narrator-b2-5",
        name_arabic: "عائشة أم المؤمنين",
        name_transliterated: "Aisha (Mother of the Believers)",
        death_year: 58,
        reliability: "sahabi",
        position: 5,
        transmission_type: null
      }
    ],
    chain_length: 5,
    weakest_link: null,
    overall_grade: "sahih"
  }
}

// Fallback chain for other hadiths (Bukhari Golden Chain)
const FALLBACK_ISNAD = {
  chain: [
    {
      id: "narrator-fb-1",
      name_arabic: "عبد الله بن يوسف التنيسي",
      name_transliterated: "Abdullah ibn Yusuf al-Tunisi",
      death_year: 218,
      reliability: "thiqah",
      position: 1,
      transmission_type: "أخبرنا"
    },
    {
      id: "narrator-fb-2",
      name_arabic: "مالك بن أنس",
      name_transliterated: "Malik ibn Anas",
      death_year: 179,
      reliability: "thiqah",
      position: 2,
      transmission_type: "عن"
    },
    {
      id: "narrator-fb-3",
      name_arabic: "نافع مولى ابن عمر",
      name_transliterated: "Nafi' mawla Ibn 'Umar",
      death_year: 117,
      reliability: "thiqah",
      position: 3,
      transmission_type: "عن"
    },
    {
      id: "narrator-fb-4",
      name_arabic: "عبد الله بن عمر",
      name_transliterated: "Abdullah ibn 'Umar",
      death_year: 73,
      reliability: "sahabi",
      position: 4,
      transmission_type: null
    }
  ],
  chain_length: 4,
  weakest_link: null,
  overall_grade: "sahih"
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hadithId: string }> }
) {
  const { hadithId } = await params
  const cleanId = decodeURIComponent(hadithId)

  // Direct hit in Isnads database
  if (ISNAD_DATABASE[cleanId]) {
    return NextResponse.json(ISNAD_DATABASE[cleanId])
  }

  // Generate dynamic response with standard Golden Chain fallback
  return NextResponse.json({
    hadith_id: cleanId,
    hadith_reference: cleanId.replace("hadith-", "").replace("-", ":"),
    ...FALLBACK_ISNAD
  })
}
