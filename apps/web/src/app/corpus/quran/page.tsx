import Link from "next/link"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { getQuranSurahs } from "@/lib/api"
import { SURAH_META } from "@/lib/quran-meta"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Le Saint Coran",
  description: "Lisez et étudiez le Saint Coran en arabe avec traductions en français et en anglais.",
  alternates: {
    canonical: "/corpus/quran",
  },
  openGraph: {
    url: "/corpus/quran",
  }
}

export default async function QuranIndexPage() {
  let surahs: Awaited<ReturnType<typeof getQuranSurahs>> = []
  let error = false

  try {
    surahs = await getQuranSurahs()
  } catch {
    error = true
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <NavBar />

      {/* Header */}
      <header
        className="sticky top-[61px] z-40 px-6 py-4"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-4 flex-wrap">
          <Link href="/corpus" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "rgba(250,247,239,0.65)" }}>
            ← Corpus
          </Link>
          <span style={{ width: "1px", height: "1rem", background: "var(--color-border)" }} />
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.15rem",
              fontWeight: 400,
              color: "var(--color-text)",
            }}
          >
            Coran
          </h1>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            114 sourates · 6 236 ayats
          </span>
          <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", opacity: 0.55 }}>
            M = mecquoise · Md = médinoise
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {error ? (
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            Impossible de charger les sourates. L&apos;API est peut-être hors ligne.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {surahs.map((s) => {
              const meta = SURAH_META[s.number]
              return (
                <Link
                  key={s.number}
                  href={`/corpus/quran/${s.number}`}
                  className="group rounded-xl border p-4 flex flex-col gap-2 transition-all hover:border-[rgba(200,157,58,0.35)] hover:bg-[rgba(200,157,58,0.03)]"
                  style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
                >
                  {/* Number */}
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                        color: "var(--color-gold)",
                        opacity: 0.7,
                      }}
                    >
                      {s.number}
                    </span>
                    {meta && (
                      <span
                        style={{
                          fontSize: "0.6rem",
                          color: "var(--color-text-muted)",
                          opacity: 0.6,
                        }}
                      >
                        {meta.revelation === "mecquoise" ? "M" : "Md"}
                      </span>
                    )}
                  </div>

                  {/* Arabic name */}
                  <p
                    dir="rtl"
                    style={{
                      fontFamily: "'Amiri', serif",
                      fontSize: "1.35rem",
                      color: "var(--color-text)",
                      lineHeight: 1.2,
                    }}
                  >
                    {s.name_arabic}
                  </p>

                  {/* Transliteration */}
                  {meta && (
                    <p
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--color-text-muted)",
                        lineHeight: 1.2,
                      }}
                    >
                      {meta.transliteration}
                    </p>
                  )}

                  {/* Ayah count */}
                  <p
                    className="mt-auto"
                    style={{ fontSize: "0.68rem", color: "var(--color-text-muted)", opacity: 0.6 }}
                  >
                    {s.ayah_count} ayat{s.ayah_count > 1 ? "s" : ""}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
