"use client"

import { useRouter } from "next/navigation"
import type { SearchResult } from "@/lib/api"

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

const MATCH_LABELS: Record<string, string> = {
  semantic: "Sémantique",
  keyword:  "Mot-clé",
  hybrid:   "Hybride",
}

const PAGE_SIZE = 50

function getContextualUrl(result: SearchResult): string {
  if (result.source_type === "quran") {
    const [surah, ayah] = result.reference.split(":")
    if (surah && ayah) return `/corpus/quran/${surah}#ayah-${ayah}`
  }
  if (result.source_type === "hadith") {
    const lastColon = result.reference.lastIndexOf(":")
    if (lastColon !== -1) {
      const collection = result.reference.slice(0, lastColon)
      const num = parseInt(result.reference.slice(lastColon + 1), 10)
      if (!isNaN(num)) {
        const page = Math.ceil(num / PAGE_SIZE)
        return `/corpus/hadith/${collection}?page=${page}#hadith-${num}`
      }
      return `/corpus/hadith/${result.collection}`
    }
  }
  if (result.source_type === "tafsir") {
    const surah = result.metadata?.surah
    if (surah && result.collection) return `/corpus/tafsir/${result.collection}/${surah}`
  }
  return `/text/${result.id}`
}

interface ResultCardProps {
  result: SearchResult
  index?: number
}

export default function ResultCard({ result, index }: ResultCardProps) {
  const router = useRouter()
  const collectionLabel = COLLECTION_LABELS[result.collection] ?? result.collection
  const matchLabel = MATCH_LABELS[result.match_type] ?? result.match_type
  const contextualUrl = getContextualUrl(result)

  const surahName =
    result.metadata && typeof result.metadata.surah_name === "string"
      ? result.metadata.surah_name
      : null

  return (
    <article
      className="flex gap-5 py-6 border-b cursor-pointer group/card transition-colors"
      style={{ borderColor: "var(--color-border)" }}
      onClick={() => router.push(contextualUrl)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") router.push(contextualUrl) }}
      aria-label={`${collectionLabel} ${result.reference}`}
    >
      {/* Number */}
      {index !== undefined && (
        <span
          className="text-sm font-mono w-5 text-right shrink-0 mt-1 leading-none"
          style={{ color: "var(--color-border-soft)" }}
        >
          {index}.
        </span>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Reference line */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className={`badge-${result.source_type} text-xs px-2 py-0.5 rounded-full font-medium shrink-0`}
          >
            {collectionLabel}
          </span>
          <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {result.reference}
          </span>
          {surahName && (
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              · {surahName}
            </span>
          )}
        </div>

        {/* Arabic text */}
        <p className="arabic-lg mb-3" style={{ color: "var(--color-gold)" }}>
          {result.arabic}
        </p>

        {/* Translation */}
        {(result.translation_fr ?? result.translation_en) && (
          <p
            className="text-sm leading-relaxed mb-4"
            style={{ color: "var(--color-text-muted)" }}
          >
            {result.translation_fr ?? result.translation_en}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3">
          <span
            className="text-xs transition-opacity group-hover/card:opacity-70"
            style={{ color: "var(--color-sage)" }}
          >
            Voir dans le corpus →
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-text-muted)",
              border: "1px solid var(--color-border)",
            }}
          >
            {matchLabel}
          </span>
          <a
            href={`/text/${result.id}`}
            className="text-xs ml-auto transition-opacity hover:opacity-70"
            style={{ color: "var(--color-text-muted)" }}
            onClick={(e) => e.stopPropagation()}
          >
            connexions →
          </a>
        </div>
      </div>
    </article>
  )
}
