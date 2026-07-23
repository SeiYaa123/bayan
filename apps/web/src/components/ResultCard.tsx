"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { SearchResult } from "@/lib/api"
import { useAudio, parseQuranReference } from "@/context/AudioContext"
import { useBookmark } from "@/context/BookmarkContext"
import ShareCardModal from "@/components/ShareCardModal"
import RootAnalyzerModal from "@/components/RootAnalyzerModal"

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
  const { togglePlayTrack, isTrackPlaying } = useAudio()
  const { toggleBookmark, isBookmarked } = useBookmark()
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isRootModalOpen, setIsRootModalOpen] = useState(false)
  const [selectedWordOrRoot, setSelectedWordOrRoot] = useState<string | null>(null)

  const collectionLabel = COLLECTION_LABELS[result.collection] ?? result.collection
  const matchLabel = MATCH_LABELS[result.match_type] ?? result.match_type
  const contextualUrl = getContextualUrl(result)
  const bookmarked = isBookmarked(result.id)

  const surahName =
    result.metadata && typeof result.metadata.surah_name === "string"
      ? result.metadata.surah_name
      : null

  const quranRef =
    result.source_type === "quran"
      ? parseQuranReference(result.reference, result.metadata)
      : null

  const isPlayingCurrent = quranRef ? isTrackPlaying(quranRef.surah, quranRef.ayah) : false

  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (quranRef) {
      togglePlayTrack({
        surah: quranRef.surah,
        ayah: quranRef.ayah,
        title: `Sourate ${quranRef.surah}:${quranRef.ayah}${surahName ? ` · ${surahName}` : ""}`,
        arabicText: result.arabic,
        surahName: surahName ?? undefined,
      })
    }
  }

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleBookmark({
      id: result.id,
      source_type: result.source_type,
      reference: result.reference,
      collection: result.collection,
      arabic: result.arabic,
      translation: result.collection === "ibn_kathir" ? (result.translation_en ?? result.translation_fr ?? undefined) : (result.translation_fr ?? result.translation_en ?? undefined),
    })
  }

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsShareModalOpen(true)
  }

  const handleAnalyzeRootClick = (e: React.MouseEvent, word?: string) => {
    e.stopPropagation()
    const targetWord = word || result.arabic.split(/\s+/)[0] || result.arabic
    setSelectedWordOrRoot(targetWord)
    setIsRootModalOpen(true)
  }

  // Tokenize Arabic text for interactive word clicking
  const arabicWords = result.arabic ? result.arabic.split(/(\s+)/) : []

  return (
    <>
      <article
        className="flex gap-5 py-6 border-b cursor-pointer group/card transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.015] hover:border-[#C89D3A]/30 hover:shadow-[0_12px_32px_rgba(200,157,58,0.06)] hover:px-4 hover:-mx-4 hover:rounded-xl hover:bg-white/[0.02] hover:bg-gradient-to-r hover:from-white/[0.02] hover:to-transparent"
        style={{ borderColor: "var(--color-border)" }}
        onClick={() => router.push(contextualUrl)}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") router.push(contextualUrl)
        }}
        aria-label={`${collectionLabel} ${result.reference}`}
      >
        {/* Number */}
        {index !== undefined && (
          <span
            className="text-sm font-mono w-5 text-right shrink-0 mt-1 leading-none transition-colors duration-300"
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

            {/* Action buttons area */}
            <div className="ml-auto flex items-center gap-2">
              {/* Root Analysis Button */}
              <button
                onClick={(e) => handleAnalyzeRootClick(e)}
                aria-label="Analyser la racine"
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
                style={{
                  background: "rgba(16, 185, 129, 0.08)",
                  color: "#34d399",
                  borderColor: "rgba(16, 185, 129, 0.3)",
                }}
                title="Analyser la racine morphologique de ce texte"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                <span>Racine</span>
              </button>

              {/* Audio Recitation Play Button */}
              {quranRef && (
                <button
                  onClick={handleAudioClick}
                  aria-label={isPlayingCurrent ? "Mettre en pause l'audio" : "Écouter la récitation"}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-all duration-300 border ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
                  style={{
                    background: isPlayingCurrent ? "rgba(200, 157, 58, 0.2)" : "rgba(200, 157, 58, 0.08)",
                    color: "var(--color-gold)",
                    borderColor: isPlayingCurrent ? "var(--color-gold)" : "rgba(200, 157, 58, 0.3)",
                  }}
                >
                  {isPlayingCurrent ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span>Écouter</span>
                    </>
                  )}
                </button>
              )}

              {/* Bookmark Toggle Button */}
              <button
                onClick={handleBookmarkClick}
                aria-label={bookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
                className="flex items-center justify-center p-1.5 rounded-full border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
                style={{
                  background: bookmarked ? "rgba(225, 29, 72, 0.15)" : "rgba(250, 247, 239, 0.05)",
                  color: bookmarked ? "#f43f5e" : "var(--color-text-muted)",
                  borderColor: bookmarked ? "rgba(244, 63, 94, 0.4)" : "var(--color-border)",
                }}
                title={bookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill={bookmarked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
                  />
                </svg>
              </button>

              {/* Generate Quote Card Button */}
              <button
                onClick={handleShareClick}
                aria-label="Générer une carte"
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
                style={{
                  background: "rgba(200, 157, 58, 0.08)",
                  color: "var(--color-gold)",
                  borderColor: "rgba(200, 157, 58, 0.3)",
                }}
                title="Générer une carte de citation"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Carte</span>
              </button>
            </div>
          </div>

          {/* Interactive Arabic text with token triggers */}
          <p className="arabic-lg mb-3" style={{ color: "var(--color-gold)" }}>
            {arabicWords.map((part, i) => {
              const isWord = part.trim().length > 0
              if (!isWord) return part
              return (
                <span
                  key={i}
                  onClick={(e) => handleAnalyzeRootClick(e, part)}
                  className="hover:underline hover:text-amber-200 hover:bg-amber-500/10 rounded px-0.5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
                  title={`Cliquer pour analyser la racine de « ${part} »`}
                >
                  {part}
                </span>
              )
            })}
          </p>

          {/* Translation */}
          {(result.translation_fr ?? result.translation_en) && (
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: "var(--color-text-muted)" }}
            >
              {result.collection === "ibn_kathir" ? (result.translation_en ?? result.translation_fr) : (result.translation_fr ?? result.translation_en)}
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
              className="text-xs px-2 py-0.5 rounded-full ml-auto"
              style={{
                background: "var(--color-surface-2)",
                color: "var(--color-text-muted)",
                border: "1px solid var(--color-border)",
              }}
            >
              {matchLabel}
            </span>
          </div>
        </div>
      </article>

      {/* Share Quote Card Modal */}
      <ShareCardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={{
          reference: result.reference,
          collection: result.collection,
          source_type: result.source_type,
          arabic: result.arabic,
          translation: result.translation_fr ?? result.translation_en ?? undefined,
        }}
      />

      {/* Root Analyzer Modal */}
      <RootAnalyzerModal
        isOpen={isRootModalOpen}
        onClose={() => setIsRootModalOpen(false)}
        wordOrRoot={selectedWordOrRoot}
      />
    </>
  )
}

