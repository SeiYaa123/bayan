"use client"

const CORPUS_FILTERS = [
  { id: "",       label: "Tout le corpus",  count: null },
  { id: "quran",  label: "Coran",           count: "6 236" },
  { id: "hadith", label: "Hadith",          count: "60 000+" },
  { id: "tafsir", label: "Tafsir",          count: null },
  { id: "fiqh",   label: "Fiqh",            count: null },
]

interface FilterBarProps {
  activeTypes: string[]
  onChange: (types: string[]) => void
}

export default function FilterBar({ activeTypes, onChange }: FilterBarProps) {
  const allSelected = activeTypes.length === 0

  const toggle = (id: string) => {
    if (id === "") {
      onChange([])
      return
    }
    onChange(
      activeTypes.includes(id)
        ? activeTypes.filter((t) => t !== id)
        : [...activeTypes, id],
    )
  }

  return (
    <div className="px-4 py-5">
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: "var(--color-text-muted)" }}
      >
        Filtrer par corpus
      </h3>

      <ul className="space-y-0.5">
        {CORPUS_FILTERS.map((c) => {
          const isActive = c.id === "" ? allSelected : activeTypes.includes(c.id)
          return (
            <li key={c.id}>
              <button
                onClick={() => toggle(c.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left"
                style={{
                  background: isActive ? "rgba(200,157,58,0.08)" : "transparent",
                  color: isActive ? "var(--color-gold)" : "var(--color-text-muted)",
                  fontWeight: isActive ? "500" : "400",
                }}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: isActive ? "var(--color-gold)" : "transparent",
                      border: `1.5px solid ${isActive ? "var(--color-gold)" : "var(--color-border-soft)"}`,
                    }}
                  />
                  {c.label}
                </span>
                {c.count && (
                  <span
                    className="text-xs tabular-nums"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {c.count}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
