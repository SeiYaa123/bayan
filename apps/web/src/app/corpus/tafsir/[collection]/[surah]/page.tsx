import Link from "next/link"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { getTafsirSurah, type TafsirEntry } from "@/lib/api"
import { SURAH_META } from "@/lib/quran-meta"

interface Props {
  params: Promise<{ collection: string; surah: string }>
}

const TAFSIR_TITLES: Record<string, string> = {
  jalalayn: "الجلالين",
  ibn_kathir: "ابن كثير",
  tabari: "الطبري",
}

import type { Metadata } from "next"

import { notFound } from "next/navigation"

export async function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({
    collection: "ibn_kathir",
    surah: (i + 1).toString(),
  }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection, surah } = await params
  const surahNum = parseInt(surah, 10)
  const meta = SURAH_META[surahNum]
  if (collection !== "ibn_kathir" || isNaN(surahNum) || surahNum < 1 || surahNum > 114 || !meta) {
    notFound()
  }
  const names: Record<string, string> = {
    jalalayn: "Tafsir al-Jalalayn",
    ibn_kathir: "Tafsir Ibn Kathir",
    tabari: "Tafsir al-Tabari",
  }
  const colName = names[collection] || collection
  return {
    title: `${colName} — Sourate ${meta.transliteration}`,
    description: `Lisez le commentaire et l'explication (tafsir) de la sourate ${meta.transliteration} par ${colName}.`,
    alternates: {
      canonical: `/corpus/tafsir/${collection}/${surahNum}`,
    },
    openGraph: {
      url: `/corpus/tafsir/${collection}/${surahNum}`,
    }
  }
}

export default async function TafsirSurahPage({ params }: Props) {
  const { collection, surah: surahParam } = await params
  const surahNum = parseInt(surahParam, 10)

  if (collection !== "ibn_kathir" || isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
    notFound()
  }

  let data: Awaited<ReturnType<typeof getTafsirSurah>> | null = null
  try {
    data = await getTafsirSurah(collection, surahNum)
  } catch {
    notFound()
  }

  const meta = SURAH_META[surahNum]
  const prevSurah = surahNum > 1 ? surahNum - 1 : null
  const nextSurah = surahNum < 114 ? surahNum + 1 : null
  const arabicTitle = TAFSIR_TITLES[collection]

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <NavBar />

      <header
        className="sticky top-[61px] z-40 px-6 py-4"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-3 flex-wrap">
          <Link
            href={`/corpus/tafsir/${collection}`}
            className="text-sm hover:opacity-70 transition-opacity"
            style={{ color: "rgba(250,247,239,0.65)" }}
          >
            ← {data.label}
          </Link>
          <span style={{ width: "1px", height: "1rem", background: "var(--color-border)" }} />
          <span
            dir="rtl"
            style={{ fontFamily: "'Amiri', serif", fontSize: "1.15rem", color: "rgba(167,139,250,0.7)", lineHeight: 1 }}
          >
            {data.surah_name}
          </span>
          {meta && (
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
              {meta.transliteration}
            </span>
          )}
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginLeft: "auto" }}>
            Sourate {surahNum} · {data.ayah_count} versets
            {meta && <> · {meta.revelation}</>}
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-6 flex justify-between items-center text-sm">
        {prevSurah ? (
          <Link
            href={`/corpus/tafsir/${collection}/${prevSurah}`}
            className="hover:opacity-80 transition-opacity"
            style={{ color: "var(--color-text-muted)" }}
          >
            ← Sourate {prevSurah}
          </Link>
        ) : <span />}
        {nextSurah ? (
          <Link
            href={`/corpus/tafsir/${collection}/${nextSurah}`}
            className="hover:opacity-80 transition-opacity"
            style={{ color: "var(--color-text-muted)" }}
          >
            Sourate {nextSurah} →
          </Link>
        ) : <span />}
      </div>

      {/* Tafsir source label */}
      <div className="max-w-4xl mx-auto px-6 pt-4">
        <div
          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 border"
          style={{ borderColor: "rgba(167,139,250,0.2)", background: "rgba(167,139,250,0.05)" }}
        >
          {arabicTitle && (
            <span
              dir="rtl"
              style={{ fontFamily: "'Amiri', serif", fontSize: "1rem", color: "rgba(167,139,250,0.75)" }}
            >
              {arabicTitle}
            </span>
          )}
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            {data.label}
          </span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-4 pb-20 flex flex-col gap-0">
        {data.entries.map((entry: TafsirEntry, idx: number) => {
          const ayahNum = entry.metadata?.ayah ?? String(idx + 1)
          return (
            <div
              key={entry.id}
              className="group border-b py-8 flex flex-col gap-4"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center gap-3">
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.7rem",
                    color: "rgba(167,139,250,0.7)",
                    background: "rgba(167,139,250,0.07)",
                    padding: "0.2rem 0.55rem",
                    borderRadius: "4px",
                  }}
                >
                  {entry.reference}
                </span>
              </div>

              <p
                dir="rtl"
                style={{
                  fontFamily: "'Amiri', serif",
                  fontSize: "clamp(1.15rem, 2.5vw, 1.5rem)",
                  color: "var(--color-text)",
                  lineHeight: 2.1,
                  textAlign: "right",
                }}
              >
                {entry.arabic}
                {" "}
                <span style={{ color: "rgba(167,139,250,0.45)", fontSize: "0.85em" }}>
                  ﴿{ayahNum}﴾
                </span>
              </p>

              {(entry.translation_fr ?? entry.translation_en) && (
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--color-text-muted)",
                    lineHeight: 1.8,
                    whiteSpace: "pre-line",
                    borderLeft: "2px solid rgba(167,139,250,0.2)",
                    paddingLeft: "1rem",
                  }}
                >
                  {collection === "ibn_kathir" ? (entry.translation_en ?? entry.translation_fr) : (entry.translation_fr ?? entry.translation_en)}
                </p>
              )}
            </div>
          )
        })}
      </main>

      <div className="border-t px-6 py-6" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-4xl mx-auto flex justify-between items-center text-sm">
          {prevSurah ? (
            <Link
              href={`/corpus/tafsir/${collection}/${prevSurah}`}
              className="hover:opacity-80 transition-opacity"
              style={{ color: "var(--color-text-muted)" }}
            >
              ← Sourate {prevSurah}
              {SURAH_META[prevSurah] && (
                <span className="ml-2" style={{ color: "rgba(167,139,250,0.7)" }}>
                  {SURAH_META[prevSurah].transliteration}
                </span>
              )}
            </Link>
          ) : <span />}
          {nextSurah ? (
            <Link
              href={`/corpus/tafsir/${collection}/${nextSurah}`}
              className="hover:opacity-80 transition-opacity"
              style={{ color: "var(--color-text-muted)" }}
            >
              {SURAH_META[nextSurah] && (
                <span className="mr-2" style={{ color: "rgba(167,139,250,0.7)" }}>
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

function NotFound({ collection }: { collection: string }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-6"
      style={{ background: "var(--color-bg)" }}
    >
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
      <Link href={`/corpus/tafsir/${collection}`} style={{ fontSize: "0.85rem", color: "rgba(167,139,250,0.8)" }}>
        ← Liste des sourates
      </Link>
    </div>
  )
}
