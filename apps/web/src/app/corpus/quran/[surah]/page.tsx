import Link from "next/link"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { getQuranSurah, type Ayah } from "@/lib/api"
import { SURAH_META } from "@/lib/quran-meta"
import AudioPlayButton from "@/components/AudioPlayButton"
import type { Metadata } from "next"
import TextDetailActions from "@/components/TextDetailActions"

interface Props {
  params: Promise<{ surah: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { surah } = await params
  const surahNum = parseInt(surah, 10)
  const meta = SURAH_META[surahNum]
  if (!meta) {
    return {
      title: "Sourate non trouvée",
    }
  }
  return {
    title: `Sourate ${meta.transliteration} (${meta.english})`,
    description: `Lisez et écoutez la sourate ${meta.transliteration} (${meta.english}) en arabe avec traductions et audio complets.`,
  }
}

export default async function SurahPage({ params }: Props) {
  const { surah: surahParam } = await params
  const surahNum = parseInt(surahParam, 10)

  if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
    return <NotFound />
  }

  let data: Awaited<ReturnType<typeof getQuranSurah>> | null = null
  try {
    data = await getQuranSurah(surahNum)
  } catch {
    return <NotFound />
  }

  const meta = SURAH_META[surahNum]
  const prevSurah = surahNum > 1 ? surahNum - 1 : null
  const nextSurah = surahNum < 114 ? surahNum + 1 : null

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <NavBar />

      {/* Header */}
      <header
        className="sticky top-[61px] z-40 px-6 py-4"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-3 flex-wrap">
          <Link href="/corpus/quran" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "rgba(250,247,239,0.65)" }}>
            ← Coran
          </Link>
          <span style={{ width: "1px", height: "1rem", background: "var(--color-border)" }} />
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
      </header>

      {/* Navigation prev/next */}
      <div className="max-w-4xl mx-auto px-6 pt-6 flex justify-between items-center text-sm">
        {prevSurah ? (
          <Link
            href={`/corpus/quran/${prevSurah}`}
            className="hover:opacity-80 transition-opacity"
            style={{ color: "var(--color-text-muted)" }}
          >
            ← Sourate {prevSurah}
          </Link>
        ) : <span />}
        {nextSurah ? (
          <Link
            href={`/corpus/quran/${nextSurah}`}
            className="hover:opacity-80 transition-opacity"
            style={{ color: "var(--color-text-muted)" }}
          >
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
        <div className="max-w-4xl mx-auto flex justify-between items-center text-sm">
          {prevSurah ? (
            <Link
              href={`/corpus/quran/${prevSurah}`}
              className="hover:opacity-80 transition-opacity"
              style={{ color: "var(--color-text-muted)" }}
            >
              ← Sourate {prevSurah}
              {SURAH_META[prevSurah] && (
                <span className="ml-2" style={{ color: "var(--color-gold)" }}>
                  {SURAH_META[prevSurah].transliteration}
                </span>
              )}
            </Link>
          ) : <span />}
          {nextSurah ? (
            <Link
              href={`/corpus/quran/${nextSurah}`}
              className="hover:opacity-80 transition-opacity"
              style={{ color: "var(--color-text-muted)" }}
            >
              {SURAH_META[nextSurah] && (
                <span className="mr-2" style={{ color: "var(--color-gold)" }}>
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
