"use client"

import { useState } from "react"
import BackLink from "@/components/BackLink"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const MADHHAB_COLORS: Record<string, string> = {
  hanafi:  "#60a5fa",
  maliki:  "#4ade80",
  shafi_i: "#f59e0b",
  hanbali: "#c084fc",
}

const SUGGESTED_TOPICS = [
  { ar: "ربا",    fr: "intérêt" },
  { ar: "زكاة",   fr: "aumône légale" },
  { ar: "طلاق",   fr: "divorce" },
  { ar: "صلاة",   fr: "prière" },
  { ar: "نكاح",   fr: "mariage" },
  { ar: "ميراث",  fr: "héritage" },
  { ar: "جهاد",   fr: "effort" },
]

interface MadhabPosition {
  madhhab: string
  madhhab_info: { name: string; founder: string; region: string }
  texts: Array<{
    id: string
    reference: string
    arabic: string
    translation_fr: string | null
    similarity: number
  }>
}

interface ComparisonData {
  topic: string
  positions: MadhabPosition[]
  convergence_score: number
}

export default function FiqhComparePage() {
  const [topic, setTopic] = useState("")
  const [data, setData] = useState<ComparisonData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const compare = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    setTopic(q)
    try {
      const res = await fetch(`${API_URL}/api/fiqh/compare?topic=${encodeURIComponent(q)}&limit=2`)
      if (!res.ok) throw new Error(res.statusText)
      setData(await res.json())
    } catch {
      setError("API indisponible.")
    } finally {
      setLoading(false)
    }
  }

  const convergencePct = data ? Math.round(data.convergence_score * 100) : 0

  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <header
        className="px-6 py-4"
        style={{ background: "#050d07", borderBottom: "1px solid rgba(250,247,239,0.06)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-4 flex-wrap">
          <BackLink light />
          <div>
            <h1 className="text-base font-semibold" style={{ color: "#C89D3A" }}>
              ⚖️ Comparaison inter-madhhabs
            </h1>
            <p className="text-xs" style={{ color: "rgba(250,247,239,0.55)" }}>
              Positions des 4 écoles sunnites sur un concept de fiqh
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-8">
        {/* Barre de recherche */}
        <div className="flex flex-col gap-3">
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3 border max-w-xl"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <input
              type="text"
              defaultValue={topic}
              onKeyDown={(e) => e.key === "Enter" && compare((e.target as HTMLInputElement).value)}
              placeholder="Ex: ربا (usure), زكاة (aumône), طلاق (divorce)..."
              className="flex-1 bg-transparent outline-none text-sm arabic"
              dir="auto"
              style={{ color: "var(--color-text)" }}
            />
            <button
              onClick={(e) => {
                const input = (e.currentTarget.previousSibling as HTMLInputElement)
                compare(input.value)
              }}
              disabled={loading}
              className="px-4 py-1.5 rounded text-sm font-medium disabled:opacity-40"
              style={{ background: "var(--color-accent)", color: "#050d07" }}
            >
              {loading ? "..." : "Comparer"}
            </button>
          </div>

          {/* Suggestions */}
          <div className="flex gap-2 flex-wrap">
            {SUGGESTED_TOPICS.map((t) => (
              <button
                key={t.ar}
                onClick={() => compare(t.ar)}
                className="px-3 py-1 rounded-full text-sm border hover:opacity-80 transition-opacity"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-muted)",
                }}
              >
                <span className="arabic">{t.ar}</span>
                <span className="opacity-60"> — {t.fr}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
        )}

        {data && (
          <>
            {/* Score de convergence */}
            <div
              className="rounded-xl p-4 border flex items-center gap-4"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div className="flex-1">
                <p className="text-sm font-medium">Convergence entre les 4 écoles</p>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                  {convergencePct >= 75
                    ? "Les 4 madhhabs convergent largement sur ce sujet."
                    : convergencePct >= 50
                    ? "Convergence partielle — des divergences existent sur les détails."
                    : "Divergences significatives entre les écoles sur ce point."}
                </p>
                <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)", opacity: 0.6, fontStyle: "italic" }}>
                  Score indicatif calculé par similarité sémantique — non normatif.
                </p>
              </div>
              <div className="text-3xl font-bold" style={{ color: "var(--color-gold)" }}>
                {convergencePct}%
              </div>
            </div>

            {/* Grille des 4 madhhabs */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {data.positions.map((pos) => {
                const color = MADHHAB_COLORS[pos.madhhab] ?? "#888"
                return (
                  <div
                    key={pos.madhhab}
                    className="rounded-xl border flex flex-col"
                    style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
                  >
                    {/* En-tête madhhab */}
                    <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                        <span className="font-semibold text-sm">{pos.madhhab_info.name}</span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {pos.madhhab_info.founder}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                        🌍 {pos.madhhab_info.region}
                      </p>
                    </div>

                    {/* Textes */}
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      {pos.texts.length === 0 ? (
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          Aucun texte disponible dans le corpus.
                        </p>
                      ) : (
                        pos.texts.map((t, i) => (
                          <div key={i} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono" style={{ color }}>
                                {t.reference}
                              </span>
                              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                {Math.round(t.similarity * 100)}%
                              </span>
                            </div>
                            <p className="arabic text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
                              {t.arabic.slice(0, 150)}
                              {t.arabic.length > 150 ? "…" : ""}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
