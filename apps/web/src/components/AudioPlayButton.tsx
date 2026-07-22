"use client"

import React from "react"
import { useAudio } from "@/context/AudioContext"

interface AudioPlayButtonProps {
  surah: number
  ayah: number
  title?: string
  arabicText?: string
  surahName?: string
  className?: string
  variant?: "badge" | "button"
}

export default function AudioPlayButton({
  surah,
  ayah,
  title,
  arabicText,
  surahName,
  className = "",
  variant = "button",
}: AudioPlayButtonProps) {
  const { togglePlayTrack, isTrackPlaying } = useAudio()
  const isPlaying = isTrackPlaying(surah, ayah)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    togglePlayTrack({
      surah,
      ayah,
      title: title ?? `Sourate ${surah}:${ayah}${surahName ? ` · ${surahName}` : ""}`,
      arabicText,
      surahName,
    })
  }

  if (variant === "badge") {
    return (
      <button
        onClick={handleClick}
        aria-label={isPlaying ? "Mettre en pause" : "Écouter audio"}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border hover:scale-105 ${className}`}
        style={{
          background: isPlaying ? "rgba(200, 157, 58, 0.25)" : "rgba(200, 157, 58, 0.08)",
          color: "var(--color-gold)",
          borderColor: isPlaying ? "var(--color-gold)" : "rgba(200, 157, 58, 0.3)",
        }}
      >
        {isPlaying ? (
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
    )
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isPlaying ? "Mettre en pause la récitation" : "Écouter la récitation audio"}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border shadow-sm hover:scale-105 ${className}`}
      style={{
        background: isPlaying ? "rgba(200, 157, 58, 0.25)" : "rgba(200, 157, 58, 0.1)",
        color: "var(--color-gold)",
        borderColor: isPlaying ? "var(--color-gold)" : "rgba(200, 157, 58, 0.35)",
      }}
    >
      {isPlaying ? (
        <>
          <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
          <span>Mettre en pause</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>Écouter la récitation</span>
        </>
      )}
    </button>
  )
}
