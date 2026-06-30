"use client"

const RELIABILITY_COLORS: Record<string, string> = {
  thiqah:  "#4ade80",
  sadouq:  "#f59e0b",
  da_if:   "#f87171",
  unknown: "#8888aa",
}

const RELIABILITY_LABELS: Record<string, string> = {
  thiqah:  "Thiqah (fiable)",
  sadouq:  "Sadouq (honnête)",
  da_if:   "Da'if (faible)",
  unknown: "Non classé",
}

interface Narrator {
  id: string
  name_arabic: string
  name_transliterated: string | null
  death_year: number | null
  reliability: string | null
  position: number
  transmission_type: string | null
}

interface IsnadChainProps {
  chain: Narrator[]
  overall_grade: string
  weakest_link: string | null
}

const GRADE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  sahih:          { label: "Sahih ✓",    color: "#4ade80", bg: "#1a4731" },
  hasan:          { label: "Hasan ~",    color: "#f59e0b", bg: "#422006" },
  "da'if":        { label: "Da'if ✗",    color: "#f87171", bg: "#3a1a1a" },
  "da'if (inconnu)": { label: "Da'if ✗", color: "#f87171", bg: "#3a1a1a" },
  unknown:        { label: "Inconnu ?",  color: "#8888aa", bg: "#1a1a26" },
}

export default function IsnadChain({ chain, overall_grade, weakest_link }: IsnadChainProps) {
  const badge = GRADE_BADGE[overall_grade] ?? GRADE_BADGE.unknown

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
            const color = RELIABILITY_COLORS[narrator.reliability ?? "unknown"]
            const label = RELIABILITY_LABELS[narrator.reliability ?? "unknown"]
            const isLast = idx === chain.length - 1

            return (
              <div key={narrator.id} className="flex items-start gap-4 relative">
                {/* Cercle sur la timeline */}
                <div
                  className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-1"
                  style={{
                    background: "var(--color-surface)",
                    borderColor: color,
                    color,
                  }}
                >
                  {narrator.position}
                </div>

                {/* Contenu */}
                <div
                  className={`flex-1 rounded-lg p-3 border mb-3 ${isLast ? "mb-0" : ""}`}
                  style={{
                    background: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="arabic text-base" style={{ color: "var(--color-text)" }}>
                        {narrator.name_arabic}
                      </p>
                      {narrator.name_transliterated && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                          {narrator.name_transliterated}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: `${color}20`, color }}
                      >
                        {label}
                      </span>
                      {narrator.death_year && (
                        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          m. {narrator.death_year} CE
                        </span>
                      )}
                    </div>
                  </div>

                  {narrator.transmission_type && !isLast && (
                    <p className="text-xs mt-2 italic" style={{ color: "var(--color-text-muted)" }}>
                      ↓ {narrator.transmission_type}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
