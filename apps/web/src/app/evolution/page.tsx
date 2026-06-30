"use client"

import { useState } from "react"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const SUGGESTED = [
  { ar: "رحمة", fr: "miséricorde" },
  { ar: "جهاد", fr: "effort" },
  { ar: "صبر",  fr: "patience" },
  { ar: "عدل",  fr: "justice" },
  { ar: "توبة", fr: "repentir" },
  { ar: "نور",  fr: "lumière" },
]

interface AyahEntry {
  id: string
  reference: string
  arabic: string
  translation_fr: string | null
  surah_number: number
  surah_name: string
  revelation_order: number | null
  similarity: number
}

interface PeriodAnalysis {
  period: string
  period_label: string
  count: number
  avg_similarity: number
  top_ayahs: AyahEntry[]
}

interface EvolutionData {
  concept: string
  meccan: PeriodAnalysis
  medinan: PeriodAnalysis
  evolution_note: string
}

export default function EvolutionPage() {
  const [concept, setConcept] = useState("")
  const [data, setData] = useState<EvolutionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    setConcept(q)
    try {
      const res = await fetch(`${API_URL}/api/semantic-evolution?concept=${encodeURIComponent(q)}&top_k=4`)
      if (!res.ok) throw new Error(res.statusText)
      setData(await res.json())
    } catch {
      setError("API indisponible.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <NavBar />

      <header
        className="px-6 py-8"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="max-w-5xl mx-auto">
          <p
            dir="rtl"
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              color: "rgba(200,157,58,0.12)",
              lineHeight: 1,
              marginBottom: "0.75rem",
              userSelect: "none",
            }}
          >
            تطور
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
              fontWeight: 300,
              color: "var(--color-text)",
              marginBottom: "0.5rem",
            }}
          >
            Évolution sémantique
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", maxWidth: "480px" }}>
            Comment un concept coranique évolue entre la période mecquoise et médinoise.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
        {/* Recherche */}
        <div className="flex flex-col gap-3">
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3 border max-w-xl"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <input
              type="text"
              onKeyDown={(e) => e.key === "Enter" && analyze((e.target as HTMLInputElement).value)}
              placeholder="Ex: رحمة (miséricorde), جهاد, صبر (patience)..."
              className="flex-1 bg-transparent outline-none text-sm arabic"
              dir="auto"
              style={{ color: "var(--color-text)" }}
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousSibling as HTMLInputElement
                analyze(input.value)
              }}
              disabled={loading}
              className="px-4 py-1.5 rounded text-sm font-medium disabled:opacity-40"
              style={{ background: "var(--color-accent)", color: "#050d07" }}
            >
              {loading ? "..." : "Analyser"}
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {SUGGESTED.map((s) => (
              <button
                key={s.ar}
                onClick={() => analyze(s.ar)}
                className="px-3 py-1 rounded-full text-sm border hover:opacity-80 transition-opacity"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-muted)",
                }}
              >
                <span className="arabic">{s.ar}</span>
                <span className="opacity-60"> — {s.fr}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>}

        {data && (
          <>
            {/* Note d'évolution */}
            <div
              className="rounded-xl p-4 border"
              style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
            >
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                {data.evolution_note}
              </p>
              <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)", opacity: 0.55, fontStyle: "italic" }}>
                Analyse générée algorithmiquement à partir des embeddings — indicative, non doctrinale.
              </p>
            </div>

            {/* Comparaison côte à côte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[data.meccan, data.medinan].map((period) => {
                const isMeccan = period.period === "meccan"
                const accent = isMeccan ? "#f59e0b" : "#60a5fa"
                return (
                  <section key={period.period} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold" style={{ color: accent }}>
                        {period.period_label}
                      </h2>
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        pertinence moy. {Math.round(period.avg_similarity * 100)}%
                      </span>
                    </div>

                    {period.top_ayahs.length === 0 ? (
                      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                        Aucun ayat trouvé (corpus partiel).
                      </p>
                    ) : (
                      period.top_ayahs.map((ayah) => (
                        <a
                          key={ayah.id}
                          href={`/text/${ayah.id}`}
                          className="rounded-lg border p-4 block hover:opacity-80 transition-opacity"
                          style={{
                            background: "var(--color-surface)",
                            borderColor: "var(--color-border)",
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono" style={{ color: accent }}>
                              {ayah.reference}
                            </span>
                            {ayah.surah_name && (
                              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                {ayah.surah_name}
                              </span>
                            )}
                          </div>
                          <p className="arabic text-base" style={{ color: "var(--color-gold)" }}>
                            {ayah.arabic.slice(0, 120)}{ayah.arabic.length > 120 ? "…" : ""}
                          </p>
                          {ayah.translation_fr && (
                            <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                              {ayah.translation_fr.slice(0, 100)}…
                            </p>
                          )}
                        </a>
                      ))
                    )}
                  </section>
                )
              })}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
