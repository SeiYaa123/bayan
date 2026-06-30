import Link from "next/link"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { getTafsirSurahs } from "@/lib/api"
import { SURAH_META } from "@/lib/quran-meta"

interface Props {
  params: Promise<{ collection: string }>
}

const TAFSIR_INFO: Record<string, { title: string; arabic: string; desc: string }> = {
  jalalayn: {
    title: "Tafsir al-Jalalayn",
    arabic: "الجلالين",
    desc: "Jalāl al-Dīn al-Maḥallī (m. 1459) et Jalāl al-Dīn al-Suyūṭī (m. 1505) · XVe siècle",
  },
  ibn_kathir: {
    title: "Tafsir Ibn Kathir",
    arabic: "ابن كثير",
    desc: "Ibn Kathīr (m. 1373) · XIVe siècle · référence sunnite",
  },
  tabari: {
    title: "Tafsir al-Tabari",
    arabic: "الطبري",
    desc: "Muḥammad ibn Jarīr al-Ṭabarī (m. 923) · IXe siècle",
  },
}

export default async function TafsirCollectionPage({ params }: Props) {
  const { collection } = await params
  const info = TAFSIR_INFO[collection]

  let surahs: Awaited<ReturnType<typeof getTafsirSurahs>> = []
  try {
    surahs = await getTafsirSurahs(collection)
  } catch {
    return <NotFound collection={collection} />
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <NavBar />

      <header
        className="sticky top-[61px] z-40 px-6 py-4"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-4 flex-wrap">
          <Link
            href="/corpus"
            className="text-sm hover:opacity-70 transition-opacity"
            style={{ color: "rgba(250,247,239,0.65)" }}
          >
            ← Corpus
          </Link>
          <span style={{ width: "1px", height: "1rem", background: "var(--color-border)" }} />
          {info && (
            <span
              dir="rtl"
              style={{ fontFamily: "'Amiri', serif", fontSize: "1.15rem", color: "rgba(167,139,250,0.8)", lineHeight: 1 }}
            >
              {info.arabic}
            </span>
          )}
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.1rem",
              fontWeight: 400,
              color: "var(--color-text)",
            }}
          >
            {info?.title ?? collection}
          </h1>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginLeft: "auto" }}>
            114 sourates · {surahs.reduce((s, r) => s + r.ayah_count, 0).toLocaleString("fr-FR")} entrées
          </span>
        </div>
      </header>

      {info && (
        <div className="max-w-6xl mx-auto px-6 pt-6 pb-2">
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            {info.desc}
          </p>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {surahs.map((s) => {
            const meta = SURAH_META[s.number]
            return (
              <Link
                key={s.number}
                href={`/corpus/tafsir/${collection}/${s.number}`}
                className="group rounded-xl border p-4 flex flex-col gap-2 transition-all hover:border-[rgba(167,139,250,0.4)] hover:bg-[rgba(167,139,250,0.03)]"
                style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
              >
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                      color: "rgba(167,139,250,0.7)",
                      opacity: 0.8,
                    }}
                  >
                    {s.number}
                  </span>
                  {meta && (
                    <span style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", opacity: 0.6 }}>
                      {meta.revelation === "mecquoise" ? "M" : "Md"}
                    </span>
                  )}
                </div>

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

                {meta && (
                  <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", lineHeight: 1.2 }}>
                    {meta.transliteration}
                  </p>
                )}

                <p
                  className="mt-auto"
                  style={{ fontSize: "0.68rem", color: "var(--color-text-muted)", opacity: 0.6 }}
                >
                  {s.ayah_count} verset{s.ayah_count > 1 ? "s" : ""}
                </p>
              </Link>
            )
          })}
        </div>
      </main>
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
        Tafsir introuvable
      </h1>
      <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
        &laquo;{collection}&raquo; n&apos;est pas disponible ou n&apos;a pas encore été ingéré.
      </p>
      <Link href="/corpus" style={{ fontSize: "0.85rem", color: "rgba(167,139,250,0.8)" }}>
        ← Corpus
      </Link>
    </div>
  )
}
