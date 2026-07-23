import type { Metadata } from "next"
import Link from "next/link"
import { getTextWithConnections, getIsnad } from "@/lib/api"
import ConnectionGraph from "@/components/ConnectionGraph"
import IsnadChain from "@/components/IsnadChain"
import BackLink from "@/components/BackLink"
import { parseQuranReference } from "@/context/AudioContext"
import AudioPlayButton from "@/components/AudioPlayButton"

import TextDetailActions from "@/components/TextDetailActions"
import InteractiveArabicText from "@/components/InteractiveArabicText"

interface Props {
  params: Promise<{ id: string }>
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://bayran.fr"

const COLLECTION_LABELS: Record<string, string> = {
  quran:     "Coran",
  bukhari:   "Sahih Bukhari",
  muslim:    "Sahih Muslim",
  abu_dawud: "Sunan Abu Dawud",
  tirmidhi:  "Jami' al-Tirmidhi",
  nasai:     "Sunan al-Nasa'i",
  ibn_majah: "Sunan Ibn Majah",
  ibn_kathir:"Tafsir Ibn Kathir",
  tabari:    "Tafsir al-Tabari",
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const data = await getTextWithConnections(id)
    if (!data) return {}

    const collectionLabel = COLLECTION_LABELS[data.collection as string] ?? data.collection
    const ref = (data.reference as string) ?? ""
    const title = `${collectionLabel} (${ref})`
    const snippet = ((data.collection === "ibn_kathir" ? (data.translation_en ?? data.translation_fr ?? data.arabic) : (data.translation_fr ?? data.translation_en ?? data.arabic)) as string) ?? ""
    const cleanSnippet = snippet.replace(/\s+/g, " ").trim()
    const description = cleanSnippet.length > 160 ? `${cleanSnippet.slice(0, 157)}...` : cleanSnippet

    const pageUrl = `${BASE_URL}/text/${id}`

    return {
      title,
      description,
      openGraph: {
        title: `${title} | Bayān`,
        description,
        url: pageUrl,
        siteName: "Bayān",
        type: "article",
        locale: "fr_FR",
        images: [
          {
            url: "/opengraph-image",
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Bayān`,
        description,
        images: ["/opengraph-image"],
      },
      alternates: {
        canonical: pageUrl,
      },
    }
  } catch {
    return {
      title: "Texte",
      description: "Consulter le texte du corpus islamique sur Bayān.",
    }
  }
}

export default async function TextDetailPage({ params }: Props) {
  const { id } = await params

  let data: Awaited<ReturnType<typeof getTextWithConnections>> | null = null
  let error: string | null = null

  try {
    data = await getTextWithConnections(id)
  } catch {
    error = "Texte introuvable ou API indisponible."
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-6" style={{ background: "var(--color-bg)" }}>
        <p
          dir="rtl"
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: "clamp(3rem, 10vw, 6rem)",
            color: "rgba(250,247,239,0.06)",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          ٤٠٤
        </p>
        <div className="text-center max-w-xs">
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.6rem",
              fontWeight: 300,
              color: "#FAF7EF",
              marginBottom: "0.75rem",
            }}
          >
            Texte introuvable
          </h1>
          <p style={{ fontSize: "0.85rem", color: "rgba(250,247,239,0.40)", lineHeight: 1.7 }}>
            Ce texte n&apos;est pas disponible ou le service est temporairement hors ligne.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/search"
            style={{
              padding: "0.6rem 1.5rem",
              background: "var(--color-gold)",
              color: "#050d07",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              borderRadius: "2px",
            }}
          >
            Rechercher
          </Link>
          <Link
            href="/"
            style={{
              padding: "0.6rem 1.5rem",
              border: "1px solid rgba(250,247,239,0.12)",
              color: "rgba(250,247,239,0.50)",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              borderRadius: "2px",
            }}
          >
            Accueil
          </Link>
        </div>
      </main>
    )
  }

  const { connections = [], ...text } = data
  const isHadith = text.source_type === "hadith"
  const collectionLabel = COLLECTION_LABELS[text.collection as string] ?? text.collection
  const quranRef = text.source_type === "quran" ? parseQuranReference(text.reference as string, text.metadata as Record<string, unknown> | undefined) : null

  const isnad = isHadith ? await getIsnad(id).catch(() => null) : null

  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header
        className="px-6 py-4"
        style={{ background: "#050d07", borderBottom: "1px solid rgba(250,247,239,0.06)" }}
      >
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <BackLink light />
          <div className="flex items-center gap-2 flex-1">
            <span className={`badge-${text.source_type} text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5`}>
              {text.source_type === "quran" && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              )}
              {text.source_type === "hadith" && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              )}
              {text.source_type === "tafsir" && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              )}
              {collectionLabel}
            </span>
            <span className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
              {text.reference as string}
            </span>
            <div className="ml-auto flex items-center gap-3">
              {quranRef && (
                <AudioPlayButton
                  surah={quranRef.surah}
                  ayah={quranRef.ayah}
                  arabicText={text.arabic as string}
                  variant="badge"
                />
              )}
              <TextDetailActions
                id={id}
                source_type={text.source_type as "quran" | "hadith" | "tafsir"}
                reference={text.reference as string}
                collection={text.collection as string}
                arabic={text.arabic as string}
                translation={(text.collection === "ibn_kathir" ? (text.translation_en ?? text.translation_fr) : (text.translation_fr ?? text.translation_en)) as string | undefined}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10">
        {/* Texte + connexions (liste) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="flex flex-col gap-6">
            {/* Audio Play Option for Quran */}
            {quranRef && (
              <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
                <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  Récitation Audio
                </span>
                <AudioPlayButton
                  surah={quranRef.surah}
                  ayah={quranRef.ayah}
                  arabicText={text.arabic as string}
                  variant="button"
                />
              </div>
            )}

            {/* Texte arabe */}
            <div
              className="rounded-xl p-6 border"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <InteractiveArabicText
                arabicText={text.arabic as string}
                showAnalyzeButton={false}
              />
            </div>

            {/* Traduction */}
            {(text.translation_fr ?? text.translation_en) && (
              <div
                className="rounded-xl p-6 border"
                style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
              >
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {(text.collection === "ibn_kathir" ? (text.translation_en ?? text.translation_fr) : (text.translation_fr ?? text.translation_en)) as string}
                </p>
              </div>
            )}

            {/* Connexions textuelles */}
            {connections.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
                  {connections.length} texte{connections.length > 1 ? "s" : ""} connecté{connections.length > 1 ? "s" : ""}
                </h2>
                {(connections as Record<string, unknown>[]).map((c, i) => (
                  <a
                    key={i}
                    href={`/text/${c.id}`}
                    className="rounded-lg p-4 border block hover:border-opacity-60 transition-colors"
                    style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge-${c.source_type} text-xs px-2 py-0.5 rounded-full`}>
                        {COLLECTION_LABELS[c.collection as string] ?? (c.collection as string)}
                      </span>
                      <span className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
                        {c.reference as string}
                      </span>
                      <span className="text-xs ml-auto" style={{ color: "var(--color-text-muted)" }}>
                        {c.ref_type as string} · {Math.round((c.confidence as number) * 100)}%
                      </span>
                    </div>
                    <p className="arabic text-base" style={{ color: "var(--color-text)" }}>
                      {(c.arabic as string).slice(0, 120)}…
                    </p>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Graphe de connexions */}
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
              Graphe de connexions
            </h2>
            <ConnectionGraph
              centerNode={{
                id: text.id as string,
                reference: text.reference as string,
                type: text.source_type as string,
              }}
              connections={connections}
            />
          </section>
        </div>

        {/* Chaîne d'isnad — hadiths uniquement */}
        {isHadith && (
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
              Chaîne de transmission (Isnad)
            </h2>
            <IsnadChain
              chain={isnad?.chain ?? []}
              overall_grade={isnad?.overall_grade ?? "unknown"}
              weakest_link={isnad?.weakest_link ?? null}
            />
          </section>
        )}
      </div>
    </main>
  )
}
