"use client"

import React from "react"
import { useAudio, RECITERS, formatTime } from "@/context/AudioContext"

const SPEED_OPTIONS = [1, 1.25, 1.5]

export default function AudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    duration,
    currentTime,
    playbackRate,
    isLooping,
    reciter,
    pauseTrack,
    resumeTrack,
    seek,
    setPlaybackRate,
    setIsLooping,
    setReciterId,
    playNextAyah,
    playPreviousAyah,
    closePlayer,
  } = useAudio()

  if (!currentTrack) return null

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    seek(time)
  }

  const handleReciterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReciterId(e.target.value)
  }

  const toggleSpeed = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length
    setPlaybackRate(SPEED_OPTIONS[nextIndex])
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 animate-in slide-in-from-bottom-4"
      style={{
        background: "rgba(10, 10, 10, 0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(200, 157, 58, 0.22)",
        boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.6)",
      }}
      aria-label="Lecteur audio de récitation du Coran"
    >
      {/* Interactive Progress Bar */}
      <div className="relative w-full group cursor-pointer" style={{ height: "6px" }}>
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeekChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          aria-label="Progression audio"
        />
        {/* Track background */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{ background: "rgba(250, 247, 239, 0.12)" }}
        />
        {/* Filled progress */}
        <div
          className="absolute top-0 left-0 h-full transition-all duration-75"
          style={{
            width: `${progressPercent}%`,
            background: "linear-gradient(90deg, #C89D3A 0%, #e8c56a 100%)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Track Info & Reciter Dropdown */}
        <div className="flex items-center gap-4 w-full md:w-1/3 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300"
            style={{
              background: "rgba(200, 157, 58, 0.12)",
              borderColor: "rgba(200, 157, 58, 0.3)",
              color: "var(--color-gold)",
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate" style={{ color: "var(--color-text)" }}>
                {currentTrack.title ?? `Sourate ${currentTrack.surah}:${currentTrack.ayah}`}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded font-mono shrink-0"
                style={{ background: "rgba(200, 157, 58, 0.15)", color: "var(--color-gold)" }}
              >
                {currentTrack.surah}:{currentTrack.ayah}
              </span>
            </div>

            {/* Reciter Selector */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Récitateur:
              </span>
              <select
                value={reciter.id}
                onChange={handleReciterChange}
                className="bg-transparent text-xs outline-none cursor-pointer border-b hover:border-gold transition-all duration-300 px-1 py-0.5 rounded"
                style={{
                  color: "var(--color-gold)",
                  borderColor: "rgba(200, 157, 58, 0.2)",
                  background: "#161616",
                }}
                aria-label="Sélection du récitateur"
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id} style={{ background: "#161616", color: "#FAF7EF" }}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Center: Playback Controls & Timestamps */}
        <div className="flex items-center justify-center gap-5 w-full md:w-1/3">
          {/* Loop / Repeat Button */}
          <button
            onClick={() => setIsLooping(!isLooping)}
            title={isLooping ? "Répétition activée" : "Activer la répétition"}
            aria-label="Basculer la répétition"
            className="p-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] relative hover:scale-110"
            style={{
              color: isLooping ? "var(--color-gold)" : "var(--color-text-muted)",
              background: isLooping ? "rgba(200, 157, 58, 0.15)" : "transparent",
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isLooping && (
              <span
                className="absolute top-0 right-0 w-2 h-2 rounded-full"
                style={{ background: "var(--color-gold)" }}
              />
            )}
          </button>

          {/* Previous Ayah */}
          <button
            onClick={playPreviousAyah}
            disabled={currentTrack.ayah <= 1}
            title="Verset précédent"
            aria-label="Verset précédent"
            className="p-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 disabled:opacity-30 disabled:scale-100"
            style={{ color: "var(--color-text)" }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          {/* Play / Pause Main Button */}
          <button
            onClick={isPlaying ? pauseTrack : resumeTrack}
            title={isPlaying ? "Pause" : "Lecture"}
            aria-label={isPlaying ? "Mettre en pause" : "Lancer la lecture"}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 active:scale-95 shadow-lg hover:shadow-gold/20"
            style={{
              background: "var(--color-gold)",
              color: "#050d07",
            }}
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next Ayah */}
          <button
            onClick={playNextAyah}
            title="Verset suivant"
            aria-label="Verset suivant"
            className="p-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110"
            style={{ color: "var(--color-text)" }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>

          {/* Speed Toggle Button */}
          <button
            onClick={toggleSpeed}
            title="Changer la vitesse de lecture"
            aria-label="Changer la vitesse de lecture"
            className="px-2 py-1 rounded border text-xs font-mono font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-gold hover:scale-105"
            style={{
              borderColor: "rgba(250, 247, 239, 0.2)",
              color: playbackRate > 1 ? "var(--color-gold)" : "var(--color-text-muted)",
              background: playbackRate > 1 ? "rgba(200, 157, 58, 0.1)" : "transparent",
            }}
          >
            {playbackRate}x
          </button>
        </div>

        {/* Right: Time & Close */}
        <div className="flex items-center justify-end gap-3.5 w-full md:w-1/3">
          <div className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
            <span style={{ color: "var(--color-text)" }}>{formatTime(currentTime)}</span>
            <span className="mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>

          <button
            onClick={closePlayer}
            title="Fermer le lecteur"
            aria-label="Fermer le lecteur audio"
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: "var(--color-text-muted)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
