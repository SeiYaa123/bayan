"use client"

import React, { useState } from "react"
import RootAnalyzerModal from "@/components/RootAnalyzerModal"

interface InteractiveArabicTextProps {
  arabicText: string
  className?: string
  style?: React.CSSProperties
  showAnalyzeButton?: boolean
}

export default function InteractiveArabicText({
  arabicText,
  className = "arabic-lg leading-relaxed",
  style = { color: "var(--color-gold)" },
  showAnalyzeButton = true,
}: InteractiveArabicTextProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)

  const words = arabicText ? arabicText.split(/(\s+)/) : []

  const handleWordClick = (word: string) => {
    setSelectedWord(word)
    setIsModalOpen(true)
  }

  const handleAnalyzeButtonClick = () => {
    const firstWord = arabicText.split(/\s+/)[0] || arabicText
    setSelectedWord(firstWord)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-3">
      {showAnalyzeButton && (
        <div className="flex justify-end">
          <button
            onClick={handleAnalyzeButtonClick}
            className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all duration-200 hover:scale-105"
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
            <span>Analyser la racine</span>
          </button>
        </div>
      )}

      <p className={className} style={style}>
        {words.map((part, i) => {
          const isWord = part.trim().length > 0
          if (!isWord) return part
          return (
            <span
              key={i}
              onClick={() => handleWordClick(part)}
              className="hover:underline hover:text-amber-200 hover:bg-amber-500/10 rounded px-0.5 transition-colors cursor-pointer"
              title={`Cliquer pour analyser la racine de « ${part} »`}
            >
              {part}
            </span>
          )
        })}
      </p>

      <RootAnalyzerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        wordOrRoot={selectedWord}
      />
    </div>
  )
}
