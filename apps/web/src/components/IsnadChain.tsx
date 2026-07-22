"use client"

import { useState } from "react"
import NarratorModal, { NarratorData } from "./NarratorModal"

const RELIABILITY_COLORS: Record<string, string> = {
  thiqah:  "#4ade80",
  thiqa:   "#4ade80",
  sadouq:  "#f59e0b",
  saduq:   "#f59e0b",
  da_if:   "#f87171",
  daif:    "#f87171",
  unknown: "#8888aa",
}

const RELIABILITY_LABELS: Record<string, string> = {
  thiqah:  "Thiqah (fiable)",
  thiqa:   "Thiqah (fiable)",
  sadouq:  "Sadouq (honnête)",
  saduq:   "Sadouq (honnête)",
  da_if:   "Da'if (faible)",
  daif:    "Da'if (faible)",
  unknown: "Non classé",
}

export interface Narrator {
  id: string
  name_arabic: string
  name_transliterated: string | null
  death_year: number | null
  reliability: string | null
  position: number
  transmission_type: string | null
  generation?: string | null
  city?: string | null
  teachers?: string[]
  students?: string[]
}

interface IsnadChainProps {
  chain: Narrator[]
  overall_grade: string
  weakest_link: string | null
  onNarratorSelect?: (narrator: Narrator) => void
}

const GRADE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  sahih:          { label: "Sahih",    color: "#4ade80", bg: "#1a4731" },
  hasan:          { label: "Hasan",    color: "#f59e0b", bg: "#422006" },
  "da'if":        { label: "Da'if",    color: "#f87171", bg: "#3a1a1a" },
  "da'if (inconnu)": { label: "Da'if", color: "#f87171", bg: "#3a1a1a" },
  unknown:        { label: "Inconnu",  color: "#8888aa", bg: "#1a1a26" },
}

export default function IsnadChain({ chain, overall_grade, weakest_link, onNarratorSelect }: IsnadChainProps) {
  const [selectedNarrator, setSelectedNarrator] = useState<NarratorData | null>(null)
  const badge = GRADE_BADGE[overall_grade] ?? GRADE_BADGE.unknown

  const handleNarratorClick = (narrator: Narrator) => {
    setSelectedNarrator(narrator)
    if (onNarratorSelect) {
      onNarratorSelect(narrator)
    }
  }

  if (chain.length === 0) {
    return (
      <div className="rounded-xl border p-6 text-center" style={{ borderColor: "var(--color-border)" }}>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Chaîne de transmission non disponible pour ce hadith.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Grade global */}
      <div className="flex items-center gap-3">
        <span
          className="px-3 py-1 rounded-full text-sm font-semibold"
          style={{ background: badge.bg, color: badge.color }}
        >
          {badge.label}
        </span>
        {weakest_link && (
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Maillon faible : <span className="arabic">{weakest_link}</span>
          </span>
        )}
      </div>

      {/* Timeline verticale */}
      <div className="relative">
        {/* Ligne verticale centrale */}
        <div
          className="absolute left-4 top-0 bottom-0 w-0.5"
          style={{ background: "var(--color-border)" }}
        />

        <div className="flex flex-col gap-0">
          {chain.map((narrator, idx) => {
            const relKey = (narrator.reliability ?? "unknown").toLowerCase().replace(/['\s]/g, "_")
            const color = RELIABILITY_COLORS[relKey] ?? RELIABILITY_COLORS.unknown
            const label = RELIABILITY_LABELS[relKey] ?? RELIABILITY_LABELS.unknown
            const isLast = idx === chain.length - 1

            return (
              <div key={narrator.id} className="flex items-start gap-4 relative group">
                {/* Cercle sur la timeline */}
                <button
                  type="button"
                  onClick={() => handleNarratorClick(narrator)}
                  className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-1 transition-transform group-hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  style={{
                    background: "var(--color-surface)",
                    borderColor: color,
                    color,
                  }}
                  title={`Voir la fiche biographique de ${narrator.name_transliterated || narrator.name_arabic}`}
                  aria-label={`Voir la fiche biographique de ${narrator.name_transliterated || narrator.name_arabic}`}
                >
                  {narrator.position}
                </button>

                {/* Contenu de la carte transmetteur */}
                <div
                  onClick={() => handleNarratorClick(narrator)}
                  className={`flex-1 rounded-lg p-3 border mb-3 cursor-pointer transition-all hover:border-amber-500/50 hover:shadow-lg group-hover:bg-amber-500/5 ${
                    isLast ? "mb-0" : ""
                  }`}
                  style={{
                    background: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleNarratorClick(narrator)
                    }
                  }}
                  aria-label={`Voir la fiche de ${narrator.name_transliterated || narrator.name_arabic}`}
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="arabic text-base font-medium group-hover:text-amber-400 transition-colors" style={{ color: "var(--color-text)" }}>
                          {narrator.name_arabic}
                        </p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity bg-amber-500/20 text-amber-400 font-mono inline-flex items-center gap-1">
                          Fiche
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </span>
                      </div>
                      {narrator.name_transliterated && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                          {narrator.name_transliterated}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${color}20`, color }}
                      >
                        {label}
                      </span>
                      {narrator.death_year && (
                        <span className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
                          m. {narrator.death_year} AH
                        </span>
                      )}
                    </div>
                  </div>

                  {narrator.transmission_type && !isLast && (
                    <p className="text-xs mt-2 italic flex items-center gap-1.5" style={{ color: "var(--color-text-muted)" }}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                      <span>{narrator.transmission_type}</span>
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Narrator Biography Modal */}
      {selectedNarrator && (
        <NarratorModal
          narrator={selectedNarrator}
          onClose={() => setSelectedNarrator(null)}
        />
      )}
    </div>
  )
}
