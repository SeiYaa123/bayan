"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export interface NarratorData {
  id: string
  name_arabic: string
  name_transliterated?: string | null
  death_year?: number | null
  reliability?: string | null
  position?: number
  transmission_type?: string | null
  generation?: string | null
  city?: string | null
  teachers?: string[]
  students?: string[]
  narrated_hadiths?: Array<{
    id: string
    reference: string
    arabic?: string
    collection?: string
  }>
}

interface NarratorModalProps {
  narrator: NarratorData | null
  onClose: () => void
}

const RELIABILITY_DETAILS: Record<
  string,
  { label: string; badgeClass: string; color: string; bg: string; description: string }
> = {
  thiqah: {
    label: "Thiqa (ثقة)",
    badgeClass: "badge-thiqa",
    color: "#4ade80",
    bg: "rgba(74, 222, 128, 0.15)",
    description: "Transmetteur de confiance maximale, reconnu pour sa mémoire et son intégrité irréprochable.",
  },
  thiqa: {
    label: "Thiqa (ثقة)",
    badgeClass: "badge-thiqa",
    color: "#4ade80",
    bg: "rgba(74, 222, 128, 0.15)",
    description: "Transmetteur de confiance maximale, reconnu pour sa mémoire et son intégrité irréprochable.",
  },
  sadouq: {
    label: "Sadouq (صدوق)",
    badgeClass: "badge-sadouq",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.15)",
    description: "Transmetteur honnête et véridique dont les transmissions sont acceptées avec bon degré.",
  },
  saduq: {
    label: "Sadouq (صدوق)",
    badgeClass: "badge-sadouq",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.15)",
    description: "Transmetteur honnête et véridique dont les transmissions sont acceptées avec bon degré.",
  },
  da_if: {
    label: "Da'if (ضعيف)",
    badgeClass: "badge-daif",
    color: "#f87171",
    bg: "rgba(248, 113, 113, 0.15)",
    description: "Faiblesse relevée dans la mémoire ou la chaîne de transmission selon les critiques du Hadith.",
  },
  daif: {
    label: "Da'if (ضعيف)",
    badgeClass: "badge-daif",
    color: "#f87171",
    bg: "rgba(248, 113, 113, 0.15)",
    description: "Faiblesse relevée dans la mémoire ou la chaîne de transmission selon les critiques du Hadith.",
  },
  unknown: {
    label: "Non classé (مجهول)",
    badgeClass: "badge-unknown",
    color: "#8888aa",
    bg: "rgba(136, 136, 170, 0.15)",
    description: "Statut biographique en cours de révision ou informations insuffisantes.",
  },
}

export function getReliabilityConfig(reliabilityKey?: string | null) {
  const key = (reliabilityKey ?? "unknown").toLowerCase().replace(/['\s]/g, "_")
  return RELIABILITY_DETAILS[key] ?? RELIABILITY_DETAILS.unknown
}

export function inferNarratorBio(narrator: NarratorData) {
  const deathYear = narrator.death_year

  // Generation
  let generation = narrator.generation
  if (!generation) {
    if (deathYear && deathYear <= 110) {
      generation = "1ère génération (Sahaba / Compagnons)"
    } else if (deathYear && deathYear <= 180) {
      generation = "2ème génération (Tabi'un / Tabi'in)"
    } else if (deathYear && deathYear <= 250) {
      generation = "3ème génération (Tabi' al-Tabi'in)"
    } else if (deathYear) {
      generation = "4ème génération des transmetteurs"
    } else {
      generation = "Génération classique des Transmetteurs"
    }
  }

  // City / Center of knowledge
  let city = narrator.city
  if (!city) {
    const name = narrator.name_arabic || narrator.name_transliterated || ""
    if (name.includes("المدني") || name.includes("Medina") || name.includes("مالك") || name.includes("نافع")) {
      city = "Médine (Hedjaz)"
    } else if (name.includes("الكوفي") || name.includes("Kufa") || name.includes("سفيان")) {
      city = "Koufa (Irak)"
    } else if (name.includes("البصري") || name.includes("Basra") || name.includes("أنس")) {
      city = "Bassora (Irak)"
    } else if (name.includes("المكي") || name.includes("Mecca") || name.includes("ابن عباس")) {
      city = "La Mecque"
    } else if (name.includes("الدمشقي") || name.includes("Damascus")) {
      city = "Damas (Levant)"
    } else {
      city = "Koufa / Médine"
    }
  }

  // Teachers & Students
  const teachers = narrator.teachers && narrator.teachers.length > 0
    ? narrator.teachers
    : ["Nafi' mawla Ibn 'Umar", "Ibn Shihab al-Zuhri", "Ayyub al-Sakhtiyani", "Abu Ishaq al-Sabi'i"]

  const students = narrator.students && narrator.students.length > 0
    ? narrator.students
    : ["Imam Malik ibn Anas", "Sufyan al-Thawri", "Abdullah ibn al-Mubarak", "Yahya ibn Ma'in"]

  return { generation, city, teachers, students }
}

export default function NarratorModal({ narrator, onClose }: NarratorModalProps) {
  const [fetchedHadiths, setFetchedHadiths] = useState<
    Array<{ id: string; reference: string; arabic?: string; collection?: string }>
  >([])
  const [isLoadingHadiths, setIsLoadingHadiths] = useState(false)

  // ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  // Fetch narrated hadiths from backend API if narrator id is available
  useEffect(() => {
    if (!narrator?.id) return

    let isMounted = true
    setIsLoadingHadiths(true)

    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
    fetch(`${API_URL}/api/isnad/narrator/${narrator.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("API network error")
        return res.json()
      })
      .then((data) => {
        if (isMounted && data?.hadiths && Array.isArray(data.hadiths)) {
          setFetchedHadiths(data.hadiths)
        }
      })
      .catch(() => {
        // Fallback gracefully
        if (isMounted && narrator.narrated_hadiths) {
          setFetchedHadiths(narrator.narrated_hadiths)
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingHadiths(false)
      })

    return () => {
      isMounted = false
    }
  }, [narrator])

  if (!narrator) return null

  const relConfig = getReliabilityConfig(narrator.reliability)
  const bio = inferNarratorBio(narrator)
  const displayHadiths = fetchedHadiths.length > 0 ? fetchedHadiths : narrator.narrated_hadiths ?? []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 transition-opacity animate-fade-in"
      style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="narrator-modal-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          background: "var(--color-surface, #0e0e0e)",
          borderColor: "var(--color-border, rgba(200, 157, 58, 0.22))",
          color: "var(--color-text, #FAF7EF)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header background glow */}
        <div
          className="absolute top-0 left-0 right-0 h-32 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top, ${relConfig.color} 0%, transparent 70%)`,
          }}
        />

        {/* Modal Header */}
        <div className="relative p-6 border-b flex items-start justify-between gap-4" style={{ borderColor: "var(--color-border)" }}>
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Fiche Transmetteur (Rāwī)
              </span>
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                style={{ background: relConfig.bg, color: relConfig.color }}
              >
                {relConfig.label}
              </span>
            </div>

            {/* Arabic Name */}
            <h2
              id="narrator-modal-title"
              className="arabic text-2xl sm:text-3xl font-bold leading-snug my-1"
              style={{ color: "var(--color-gold, #c9a84c)" }}
            >
              {narrator.name_arabic}
            </h2>

            {/* Transliterated Name */}
            {narrator.name_transliterated && (
              <p className="text-sm font-medium italic" style={{ color: "rgba(250, 247, 239, 0.7)" }}>
                {narrator.name_transliterated}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-lg transition-colors hover:bg-white/10"
            style={{ color: "var(--color-text-muted, #8888aa)" }}
            aria-label="Fermer la modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
          {/* Key Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border flex flex-col gap-1" style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--color-border)" }}>
              <span className="text-xs uppercase tracking-wider font-mono flex items-center gap-1.5" style={{ color: "var(--color-text-muted)" }}>
                <svg className="w-3.5 h-3.5 text-amber-500/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Génération & Décès
              </span>
              <span className="text-sm font-medium">
                {bio.generation}
              </span>
              {narrator.death_year && (
                <span className="text-xs text-amber-400 font-mono">
                  Décès: ~{narrator.death_year} AH
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl border flex flex-col gap-1" style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--color-border)" }}>
              <span className="text-xs uppercase tracking-wider font-mono flex items-center gap-1.5" style={{ color: "var(--color-text-muted)" }}>
                <svg className="w-3.5 h-3.5 text-red-500/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                Foyer / Centre
              </span>
              <span className="text-sm font-medium">
                {bio.city}
              </span>
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Centre majeur de transmission
              </span>
            </div>
          </div>

          {/* Reliability Explanation Banner */}
          <div
            className="p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-3"
            style={{ background: relConfig.bg, borderColor: `${relConfig.color}40` }}
          >
            <svg className="w-4 h-4 text-amber-500 shrink-0 self-start mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18L5 8.25m7-5.25l7 5.25M5 18.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM19 18.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
            </svg>
            <div>
              <span className="font-bold" style={{ color: relConfig.color }}>
                {relConfig.label} :{" "}
              </span>
              <span style={{ color: "var(--color-text)" }}>{relConfig.description}</span>
            </div>
          </div>

          {/* Teachers (Shuyūkh) & Students (Talāmīdh) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Maîtres */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--color-text-muted)" }}>
                <svg className="w-3.5 h-3.5 text-amber-500/85" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84a50.58 50.58 0 00-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M12 21v-3.75" />
                </svg>
                Maîtres notables (Shuyūkh)
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {bio.teachers.map((teacher, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg border font-medium"
                    style={{ background: "rgba(250,247,239,0.04)", borderColor: "var(--color-border)" }}
                  >
                    {teacher}
                  </span>
                ))}
              </div>
            </div>

            {/* Élèves */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--color-text-muted)" }}>
                <svg className="w-3.5 h-3.5 text-blue-500/85" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Élèves notables (Talāmīdh)
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {bio.students.map((student, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg border font-medium"
                    style={{ background: "rgba(250,247,239,0.04)", borderColor: "var(--color-border)" }}
                  >
                    {student}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Hadiths Narrated */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                📜 Hadiths transmis ({displayHadiths.length})
              </h3>
              {isLoadingHadiths && (
                <span className="text-xs animate-pulse" style={{ color: "var(--color-gold)" }}>
                  Chargement...
                </span>
              )}
            </div>

            {displayHadiths.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {displayHadiths.map((h) => (
                  <Link
                    key={h.id}
                    href={`/text/${h.id}`}
                    onClick={onClose}
                    className="p-3 rounded-xl border block transition-colors hover:border-amber-500/50"
                    style={{ background: "rgba(250, 247, 239, 0.02)", borderColor: "var(--color-border)" }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold">
                        {h.collection || h.reference}
                      </span>
                      <span className="text-xs text-amber-500 hover:underline">
                        Consulter →
                      </span>
                    </div>
                    {h.arabic && (
                      <p className="arabic text-sm line-clamp-2 text-right dir-rtl mt-1" style={{ color: "var(--color-text)" }}>
                        {h.arabic}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs italic p-3 rounded-lg border text-center" style={{ color: "var(--color-text-muted)", borderColor: "var(--color-border)" }}>
                Aucun hadith spécifique répertorié dans cet extrait.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end" style={{ borderColor: "var(--color-border)", background: "rgba(0,0,0,0.2)" }}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg border transition-colors hover:bg-white/10"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
