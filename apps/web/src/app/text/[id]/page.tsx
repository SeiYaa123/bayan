import Link from "next/link"
import { getTextWithConnections, getIsnad } from "@/lib/api"
import ConnectionGraph from "@/components/ConnectionGraph"
import IsnadChain from "@/components/IsnadChain"
import BackLink from "@/components/BackLink"

interface Props {
  params: Promise<{ id: string }>
}

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
  hanafi:    "Fiqh Hanafi",
  maliki:    "Fiqh Maliki",
  shafi_i:   "Fiqh Shafi'i",
  hanbali:   "Fiqh Hanbali",
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
          <div className="flex items-center gap-2">
            <span className={`badge-${text.source_type} text-xs px-2 py-0.5 rounded-full font-medium`}>
              {text.source_type === "quran"  && "📖 "}
              {text.source_type === "hadith" && "📜 "}
              {text.source_type === "tafsir" && "🔍 "}
              {text.source_type === "fiqh"   && "⚖️ "}
              {collectionLabel}
            </span>
            <span className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
              {text.reference as string}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10">
        {/* Texte + connexions (liste) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="flex flex-col gap-6">
            {/* Texte arabe */}
            <div
              className="rounded-xl p-6 border"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <p className="arabic-lg leading-relaxed" style={{ color: "var(--color-gold)" }}>
                {text.arabic as string}
              </p>
            </div>

            {/* Traduction */}
            {(text.translation_fr ?? text.translation_en) && (
              <div
                className="rounded-xl p-6 border"
                style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
              >
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {(text.translation_fr ?? text.translation_en) as string}
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
