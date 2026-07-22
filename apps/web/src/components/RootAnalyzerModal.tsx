"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  getDetailedRootAnalysis,
  DetailedRootData,
  stripArabicTashkil,
} from "@/lib/rootsData"

interface RootAnalyzerModalProps {
  isOpen: boolean
  onClose: () => void
  wordOrRoot: string | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export default function RootAnalyzerModal({
  isOpen,
  onClose,
  wordOrRoot,
}: RootAnalyzerModalProps) {
  const [data, setData] = useState<DetailedRootData | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen || !wordOrRoot) {
      setData(null)
      return
    }

    let isMounted = true
    setLoading(true)

    // Initial fallback data immediately for instant responsive UX
    const fallbackData = getDetailedRootAnalysis(wordOrRoot)
    setData(fallbackData)

    // Attempt to fetch live enrichment from backend /api/roots/analyze
    const fetchLiveAnalysis = async () => {
      try {
        const cleanToken = stripArabicTashkil(wordOrRoot)
        const res = await fetch(
          `${API_URL}/api/roots/analyze?token=${encodeURIComponent(cleanToken)}`,
        )
        if (res.ok && isMounted) {
          const json = await res.json()
          if (json.root) {
            const enriched = getDetailedRootAnalysis(json.root)
            // Merge counts or live data if present
            if (json.analysis?.quran_count) {
              enriched.stats.quran = json.analysis.quran_count
              enriched.stats.total =
                enriched.stats.quran +
                enriched.stats.hadith +
                enriched.stats.tafsir
            }
            setData(enriched)
          }
        }
      } catch {
        // Fallback data is already loaded gracefully
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchLiveAnalysis()

    return () => {
      isMounted = false
    }
  }, [isOpen, wordOrRoot])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !wordOrRoot || !data) return null

  const handleCopyRoot = () => {
    navigator.clipboard.writeText(data.rootDisplay)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const searchUrlAll = `/search?q=${encodeURIComponent(data.root)}`
  const searchUrlQuran = `/search?q=${encodeURIComponent(data.root)}&types=quran`
  const searchUrlHadith = `/search?q=${encodeURIComponent(data.root)}&types=hadith`
  const searchUrlTafsir = `/search?q=${encodeURIComponent(data.root)}&types=tafsir`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{
        background: "rgba(10, 10, 10, 0.65)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="root-modal-title"
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
        style={{
          background: "var(--color-surface, #0e0e0e)",
          borderColor: "rgba(200, 157, 58, 0.25)",
          color: "var(--color-text, #FAF7EF)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Calligraphic Ambient Top Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full pointer-events-none opacity-20 blur-3xl"
          style={{ background: "var(--color-gold, #c89d3a)" }}
        />

        {/* Modal Header */}
        <div
          className="relative px-6 py-5 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: "rgba(250, 247, 239, 0.08)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium tracking-wide uppercase border"
              style={{
                background: "rgba(200, 157, 58, 0.12)",
                color: "var(--color-gold, #c89d3a)",
                borderColor: "rgba(200, 157, 58, 0.3)",
              }}
            >
              Lexique & Morphologie
            </span>
            {loading && (
              <span className="text-xs text-amber-300/70 animate-pulse">
                Analyse live…
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyRoot}
              className="text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 hover:scale-105"
              style={{
                background: "rgba(250, 247, 239, 0.05)",
                borderColor: "rgba(250, 247, 239, 0.15)",
                color: "var(--color-text-muted, #a3b1a6)",
              }}
              title="Copier la racine"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-emerald-400 font-medium">Copié !</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copier</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border transition-all hover:bg-white/10"
              style={{
                borderColor: "rgba(250, 247, 239, 0.15)",
                color: "var(--color-text-muted, #a3b1a6)",
              }}
              aria-label="Fermer la modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          {/* Main Calligraphic Root Banner */}
          <div
            className="rounded-2xl p-6 text-center border relative overflow-hidden flex flex-col items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, rgba(200, 157, 58, 0.08) 0%, rgba(13, 25, 18, 0.6) 100%)",
              borderColor: "rgba(200, 157, 58, 0.3)",
            }}
          >
            <span className="text-xs uppercase tracking-widest text-amber-200/60 font-mono">
              Racine Trilitère (الجَذْرُ الثُّلَاثِيّ)
            </span>

            <h2
              id="root-modal-title"
              dir="rtl"
              style={{
                fontFamily: "'Amiri', 'Traditional Arabic', serif",
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                lineHeight: 1.2,
                color: "var(--color-gold, #c89d3a)",
                textShadow: "0 0 25px rgba(200, 157, 58, 0.3)",
              }}
              className="font-bold my-1 tracking-widest select-all"
            >
              {data.rootDisplay}
            </h2>

            <p className="text-base font-medium max-w-xl text-center" style={{ color: "var(--color-text)" }}>
              {data.meaning_fr}
            </p>
            <p className="text-xs italic text-center" style={{ color: "var(--color-text-muted)" }}>
              {data.meaning_en}
            </p>

            {/* Derived forms badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-3 border-t w-full max-w-lg" style={{ borderColor: "rgba(250, 247, 239, 0.08)" }}>
              <span className="text-xs text-amber-200/50 mr-1">Formes dérivées :</span>
              {data.forms.map((form, idx) => (
                <span
                  key={idx}
                  dir="rtl"
                  className="px-2.5 py-0.5 rounded-full text-xs font-serif border"
                  style={{
                    background: "rgba(250, 247, 239, 0.05)",
                    borderColor: "rgba(200, 157, 58, 0.2)",
                    color: "var(--color-gold, #c89d3a)",
                  }}
                >
                  {form}
                </span>
              ))}
            </div>
          </div>

          {/* Classical Lexicon Section (Lisān al-ʿArab) */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#C89D3A] self-center" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-base font-semibold" style={{ color: "var(--color-gold, #c89d3a)" }}>
                Définition dans les Lexiques Classiques (لسان العرب)
              </h3>
            </div>
            <div
              className="p-5 rounded-xl border relative"
              style={{
                background: "rgba(10, 20, 14, 0.6)",
                borderColor: "rgba(250, 247, 239, 0.08)",
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono text-amber-200/60 uppercase">
                  Lisān al-ʿArab (ابن منظور)
                </span>
                <span className="text-xs text-amber-300/40 italic">Lexicon d&apos;autorité</span>
              </div>
              <p
                dir="rtl"
                className="text-base sm:text-lg leading-loose font-serif mb-3 text-right"
                style={{
                  color: "#FAF7EF",
                  fontFamily: "'Amiri', serif",
                }}
              >
                « {data.lisan_al_arab_def} »
              </p>
            </div>
          </section>

          {/* Verb Forms Breakdown (Form I to Form X) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#C89D3A] self-center" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .225c-.008.379.137.751.43.992l1.003.828a1.125 1.125 0 01.26 1.43l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.216-.456a1.125 1.125 0 00-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281a1.125 1.125 0 00-.646-.87a6.57 6.57 0 01-.22-.127a1.125 1.125 0 00-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.43l1.003-.827c.293-.24.438-.613.43-.992a7.723 7.723 0 010-.225c.008-.379-.137-.751-.43-.992l-1.003-.828a1.125 1.125 0 01-.26-1.43l1.296-2.247a1.125 1.125 0 011.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128c.332-.183.582-.495.645-.869l.214-1.28z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-base font-semibold" style={{ color: "var(--color-gold, #c89d3a)" }}>
                  Déclinaison des Formes Verbales (أوزans الفعل)
                </h3>
              </div>
              <span className="text-xs text-amber-200/50">Formes I à X</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.verbForms.map((vf, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all hover:border-amber-500/40"
                  style={{
                    background: "rgba(250, 247, 239, 0.02)",
                    borderColor: "rgba(250, 247, 239, 0.08)",
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-amber-400">
                        {vf.formNumber}
                      </span>
                      <span dir="rtl" className="text-sm font-mono font-bold text-amber-200/90">
                        {vf.pattern}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-emerald-100/90 mb-2">
                      {vf.translation}
                    </p>
                  </div>

                  <div className="pt-2 border-t flex flex-col gap-1" style={{ borderColor: "rgba(250, 247, 239, 0.06)" }}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-200/40">Exemple :</span>
                      <span dir="rtl" className="font-serif font-bold text-amber-300">
                        {vf.arabicExample}
                      </span>
                    </div>
                    {vf.quranExample && (
                      <p dir="rtl" className="text-xs text-amber-200/70 font-serif text-right mt-1 bg-black/20 p-2 rounded">
                        « {vf.quranExample} »
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Occurrences Stats in Corpus */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#C89D3A] self-center" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <h3 className="text-base font-semibold" style={{ color: "var(--color-gold, #c89d3a)" }}>
                Occurrences dans le Corpus Bayān
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                className="p-3.5 rounded-xl border text-center flex flex-col gap-1"
                style={{
                  background: "rgba(59, 130, 246, 0.08)",
                  borderColor: "rgba(59, 130, 246, 0.2)",
                }}
              >
                <span className="text-xs font-medium text-blue-300 flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Coran
                </span>
                <span className="text-xl font-bold text-blue-200 font-mono">
                  {data.stats.quran}
                </span>
                <span className="text-[10px] text-blue-300/60">ayats</span>
              </div>

              <div
                className="p-3.5 rounded-xl border text-center flex flex-col gap-1"
                style={{
                  background: "rgba(16, 185, 129, 0.08)",
                  borderColor: "rgba(16, 185, 129, 0.2)",
                }}
              >
                <span className="text-xs font-medium text-emerald-300 flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Hadith
                </span>
                <span className="text-xl font-bold text-emerald-200 font-mono">
                  {data.stats.hadith}
                </span>
                <span className="text-[10px] text-emerald-300/60">hadiths</span>
              </div>

              <div
                className="p-3.5 rounded-xl border text-center flex flex-col gap-1"
                style={{
                  background: "rgba(168, 85, 247, 0.08)",
                  borderColor: "rgba(168, 85, 247, 0.2)",
                }}
              >
                <span className="text-xs font-medium text-purple-300 flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  Tafsir
                </span>
                <span className="text-xl font-bold text-purple-200 font-mono">
                  {data.stats.tafsir}
                </span>
                <span className="text-[10px] text-purple-300/60">commentaires</span>
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer / Direct Search Actions */}
        <div
          className="p-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0"
          style={{
            borderColor: "rgba(250, 247, 239, 0.08)",
            background: "rgba(5, 13, 7, 0.6)",
          }}
        >
          <div className="text-xs text-amber-200/60">
            Total : <strong className="text-amber-300 font-mono">{data.stats.total}</strong> occurrences trouvées dans Bayān
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Link
              href={searchUrlQuran}
              onClick={onClose}
              className="text-xs px-3 py-2 rounded-lg border transition-all hover:bg-white/10"
              style={{
                borderColor: "rgba(250, 247, 239, 0.15)",
                color: "var(--color-text-muted)",
              }}
            >
              Coran uniquement
            </Link>

            <Link
              href={searchUrlAll}
              onClick={onClose}
              className="flex-1 sm:flex-none text-xs px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02]"
              style={{
                background: "var(--color-gold, #c89d3a)",
                color: "#050d07",
              }}
            >
              <span>Rechercher tout « {data.rootDisplay} »</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
