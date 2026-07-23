import Link from "next/link"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { getQuranSurah, type Ayah } from "@/lib/api"
import { SURAH_META } from "@/lib/quran-meta"
import AudioPlayButton from "@/components/AudioPlayButton"
import type { Metadata } from "next"
import TextDetailActions from "@/components/TextDetailActions"

import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ surah: string }>
}

export async function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({
    surah: (i + 1).toString(),
  }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { surah } = await params
  const surahNum = parseInt(surah, 10)
  const meta = SURAH_META[surahNum]
  if (isNaN(surahNum) || surahNum < 1 || surahNum > 114 || !meta) {
    notFound()
  }
  return {
    title: `Sourate ${meta.transliteration} (${meta.english})`,
    description: `Lisez et écoutez la sourate ${meta.transliteration} (${meta.english}) en arabe avec traductions et audio complets.`,
    alternates: {
      canonical: `/corpus/quran/${surahNum}`,
    },
    openGraph: {
      url: `/corpus/quran/${surahNum}`,
    }
  }
}

export default async function SurahPage({ params }: Props) {
  const { surah: surahParam } = await params
  const surahNum = parseInt(surahParam, 10)

  if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
    notFound()
  }

  let data: Awaited<ReturnType<typeof getQuranSurah>> | null = null
  try {
    data = await getQuranSurah(surahNum)
  } catch {
    notFound()
  }

  const meta = SURAH_META[surahNum]
  const prevSurah = surahNum > 1 ? surahNum - 1 : null
  const nextSurah = surahNum < 114 ? surahNum + 1 : null

  // Breadcrumb schema
  const breadcrumbJson = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://www.bayran.fr" },
      { "@type": "ListItem", "position": 2, "name": "Corpus", "item": "https://www.bayran.fr/corpus" },
      { "@type": "ListItem", "position": 3, "name": "Coran", "item": "https://www.bayran.fr/corpus/quran" },
      { "@type": "ListItem", "position": 4, "name": `Sourate ${meta.transliteration}`, "item": `https://www.bayran.fr/corpus/quran/${surahNum}` }
    ]
  }

  // WebPage & Chapter schema
  const webpageJson = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `https://www.bayran.fr/corpus/quran/${surahNum}`,
    "url": `https://www.bayran.fr/corpus/quran/${surahNum}`,
    "name": `Sourate ${meta.transliteration} (${meta.english})`,
    "description": `Lisez et écoutez la sourate ${meta.transliteration} (${meta.english}) en arabe avec traductions et audio complets.`,
    "inLanguage": ["ar", "fr"],
    "isPartOf": { "@id": "https://www.bayran.fr/#website" },
    "mainEntity": {
      "@type": "Chapter",
      "name": meta.transliteration,
      "alternateName": meta.english,
      "position": surahNum,
      "inLanguage": "ar",
      "isPartOf": {
        "@type": "Book",
        "name": "Coran",
        "alternateName": "القرآن الكريم",
        "inLanguage": "ar"
      },
      "hasPart": data.ayahs.slice(0, 3).map((v: Ayah) => ({
        "@type": "Quotation",
        "position": parseInt(v.reference.split(":")[1], 10),
        "text": v.arabic,
        "inLanguage": "ar",
        "about": v.translation_fr ?? undefined,
        "citation": `Coran ${v.reference}`
      }))
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageJson) }}
      />
      <NavBar />

      {/* Header */}
      <header
        className="sticky top-[61px] z-40 px-6 py-4"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          {/* Breadcrumb component */}
          <div className="flex items-center gap-2 text-xs text-[rgba(250,247,239,0.45)]">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/corpus" className="hover:text-white transition-colors">Corpus</Link>
            <span>/</span>
            <Link href="/corpus/quran" className="hover:text-white transition-colors">Coran</Link>
            <span>/</span>
            <span className="text-[rgba(250,247,239,0.7)]">Sourate {meta.transliteration}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/corpus/quran" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "rgba(250,247,239,0.65)" }}>
              ← Coran
            </Link>
            <span style={{ width: "1px", height: "1rem", background: "var(--color-border)" }} />
            <h1 className="flex items-center gap-2 flex-wrap">
              <span
                dir="rtl"
                style={{ fontFamily: "'Amiri', serif", fontSize: "1.15rem", color: "var(--color-gold)", lineHeight: 1 }}
              >
                {data.surah_name}
              </span>
              {meta && (
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  {meta.transliteration}
                </span>
              )}
            </h1>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              Sourate {surahNum} · {data.ayah_count} ayats
              {meta && <> · {meta.revelation}</>}
            </span>

            <div className="ml-auto">
              <AudioPlayButton
                surah={surahNum}
                ayah={1}
                surahName={data.surah_name}
                title={`Sourate ${surahNum} · ${data.surah_name}`}
                variant="badge"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation prev/next */}
      <div className="max-w-4xl mx-auto px-6 pt-6 flex justify-between items-center text-xs sm:text-sm">
        {prevSurah ? (
          <Link
            href={`/corpus/quran/${prevSurah}`}
            className="px-4 py-2 rounded-lg border transition-all duration-300 hover:border-[rgba(200,157,58,0.45)] hover:bg-white/[0.02]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
          >
            ← Sourate {prevSurah}
            {SURAH_META[prevSurah] && (
              <span className="hidden sm:inline ml-2" style={{ color: "var(--color-gold)" }}>
                {SURAH_META[prevSurah].transliteration}
              </span>
            )}
          </Link>
        ) : <span />}
        {nextSurah ? (
          <Link
            href={`/corpus/quran/${nextSurah}`}
            className="px-4 py-2 rounded-lg border transition-all duration-300 hover:border-[rgba(200,157,58,0.45)] hover:bg-white/[0.02]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
          >
            {SURAH_META[nextSurah] && (
              <span className="hidden sm:inline mr-2" style={{ color: "var(--color-gold)" }}>
                {SURAH_META[nextSurah].transliteration}
              </span>
            )}
            Sourate {nextSurah} →
          </Link>
        ) : <span />}
      </div>

      {/* Bismillah (toutes sourates sauf 1 et 9) */}
      {surahNum !== 1 && surahNum !== 9 && (
        <div className="max-w-4xl mx-auto px-6 pt-8 pb-2 text-center">
          <p
            dir="rtl"
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: "clamp(1.4rem, 3.5vw, 1.9rem)",
              color: "rgba(200,157,58,0.5)",
              lineHeight: 1.6,
            }}
          >
            بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ
          </p>
        </div>
      )}

      {/* Ayats */}
      <main className="max-w-4xl mx-auto px-6 pt-6 pb-20 flex flex-col gap-0">
        {data.ayahs.map((ayah: Ayah, idx: number) => {
          const ayahNumStr = ayah.metadata?.ayah ?? String(idx + 1)
          const ayahNum = parseInt(ayahNumStr, 10) || (idx + 1)
          return (
            <div
              key={ayah.id}
              id={`ayah-${ayahNum}`}
              className="group border-b py-8 flex flex-col gap-4 scroll-mt-32 target:bg-[rgba(200,157,58,0.05)] target:rounded-lg target:px-4 target:-mx-4 transition-colors"
              style={{ borderColor: "var(--color-border)" }}
            >
              {/* Reference badge & Audio button */}
              <div className="flex items-center gap-3">
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.7rem",
                    color: "var(--color-gold)",
                    background: "rgba(200,157,58,0.08)",
                    padding: "0.2rem 0.55rem",
                    borderRadius: "4px",
                  }}
                >
                  {ayah.reference}
                </span>

                <AudioPlayButton
                  surah={surahNum}
                  ayah={ayahNum}
                  surahName={data.surah_name}
                  arabicText={ayah.arabic}
                  variant="badge"
                />
              </div>

              {/* Arabic */}
              <p
                dir="rtl"
                style={{
                  fontFamily: "'Amiri', serif",
                  fontSize: "clamp(1.4rem, 3.5vw, 1.85rem)",
                  color: "var(--color-text)",
                  lineHeight: 2,
                  textAlign: "right",
                }}
              >
                {ayah.arabic}
                {" "}
                <span style={{ color: "rgba(200,157,58,0.55)", fontSize: "0.85em" }}>
                  ﴿{ayahNum}﴾
                </span>
              </p>

              {/* Translation */}
              {(ayah.translation_fr ?? ayah.translation_en) && (
                <p
                  style={{
                    fontSize: "0.88rem",
                    color: "var(--color-text-muted)",
                    lineHeight: 1.75,
                    maxWidth: "680px",
                  }}
                >
                  {ayah.translation_fr ?? ayah.translation_en}
                </p>
              )}

              {/* Actions */}
              <div className="mt-2.5 flex justify-start">
                <TextDetailActions
                  id={ayah.id}
                  source_type="quran"
                  reference={ayah.reference}
                  collection="quran"
                  arabic={ayah.arabic}
                  translation={ayah.translation_fr ?? ayah.translation_en ?? undefined}
                />
              </div>
            </div>
          )
        })}
      </main>

      {/* Bottom navigation */}
      <div
        className="border-t px-6 py-6"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="max-w-4xl mx-auto flex justify-between items-center text-xs sm:text-sm">
          {prevSurah ? (
            <Link
              href={`/corpus/quran/${prevSurah}`}
              className="px-4 py-2 rounded-lg border transition-all duration-300 hover:border-[rgba(200,157,58,0.45)] hover:bg-white/[0.02]"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
            >
              ← Sourate {prevSurah}
              {SURAH_META[prevSurah] && (
                <span className="hidden sm:inline ml-2" style={{ color: "var(--color-gold)" }}>
                  {SURAH_META[prevSurah].transliteration}
                </span>
              )}
            </Link>
          ) : <span />}
          {nextSurah ? (
            <Link
              href={`/corpus/quran/${nextSurah}`}
              className="px-4 py-2 rounded-lg border transition-all duration-300 hover:border-[rgba(200,157,58,0.45)] hover:bg-white/[0.02]"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
            >
              {SURAH_META[nextSurah] && (
                <span className="hidden sm:inline mr-2" style={{ color: "var(--color-gold)" }}>
                  {SURAH_META[nextSurah].transliteration}
                </span>
              )}
              Sourate {nextSurah} →
            </Link>
          ) : <span />}
        </div>
      </div>
      <Footer />
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6" style={{ background: "var(--color-bg)" }}>
      <p
        dir="rtl"
        style={{ fontFamily: "'Amiri', serif", fontSize: "4rem", color: "rgba(250,247,239,0.06)", lineHeight: 1 }}
      >
        ٤٠٤
      </p>
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.5rem",
          fontWeight: 300,
          color: "var(--color-text)",
        }}
      >
        Sourate introuvable
      </h1>
      <Link href="/corpus/quran" style={{ fontSize: "0.85rem", color: "var(--color-gold)" }}>
        ← Liste des sourates
      </Link>
    </div>
  )
}
