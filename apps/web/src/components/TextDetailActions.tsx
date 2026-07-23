"use client"

import React, { useState } from "react"
import { useBookmark } from "@/context/BookmarkContext"
import ShareCardModal from "@/components/ShareCardModal"
import RootAnalyzerModal from "@/components/RootAnalyzerModal"

interface TextDetailActionsProps {
  id: string
  source_type: "quran" | "hadith" | "tafsir"
  reference: string
  collection?: string
  arabic: string
  translation?: string
}

export default function TextDetailActions({
  id,
  source_type,
  reference,
  collection,
  arabic,
  translation,
}: TextDetailActionsProps) {
  const { toggleBookmark, isBookmarked } = useBookmark()
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isRootModalOpen, setIsRootModalOpen] = useState(false)
  const bookmarked = isBookmarked(id)

  const handleBookmarkToggle = () => {
    toggleBookmark({
      id,
      source_type,
      reference,
      collection,
      arabic,
      translation,
    })
  }

  const initialWord = arabic ? arabic.split(/\s+/)[0] || arabic : "رحم"

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Root Analysis Button */}
        <button
          onClick={() => setIsRootModalOpen(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all duration-200 hover:scale-105"
          style={{
            background: "rgba(16, 185, 129, 0.1)",
            color: "#34d399",
            borderColor: "rgba(16, 185, 129, 0.35)",
          }}
          title="Analyser la racine morphologique de ce texte"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          <span className="hidden sm:inline">Analyser la racine</span>
          <span className="sm:hidden">Racine</span>
        </button>

        {/* Bookmark Toggle Button */}
        <button
          onClick={handleBookmarkToggle}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all duration-200 hover:scale-105"
          style={{
            background: bookmarked ? "rgba(244, 63, 94, 0.15)" : "rgba(250, 247, 239, 0.06)",
            color: bookmarked ? "#f43f5e" : "var(--color-text)",
            borderColor: bookmarked ? "rgba(244, 63, 94, 0.4)" : "var(--color-border)",
          }}
        >
          <svg
            className="w-4 h-4"
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
          <span className="hidden sm:inline">{bookmarked ? "Favori" : "Ajouter aux favoris"}</span>
          <span className="sm:hidden">Favori</span>
        </button>

        {/* Share Quote Card Button */}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all duration-200 hover:scale-105"
          style={{
            background: "rgba(200, 157, 58, 0.1)",
            color: "var(--color-gold)",
            borderColor: "rgba(200, 157, 58, 0.35)",
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="hidden sm:inline">Générer une carte</span>
          <span className="sm:hidden">Carte</span>
        </button>
      </div>

      <ShareCardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={{
          reference,
          collection,
          source_type,
          arabic,
          translation,
        }}
      />

      <RootAnalyzerModal
        isOpen={isRootModalOpen}
        onClose={() => setIsRootModalOpen(false)}
        wordOrRoot={initialWord}
      />
    </>
  )
}
