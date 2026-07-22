"use client"

import { useState } from "react"
import Link from "next/link"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { useBookmark, BookmarkItem } from "@/context/BookmarkContext"

export default function BookmarksPage() {
  const { bookmarks, removeBookmark, clearBookmarks } = useBookmark()
  const [filterType, setFilterType] = useState<"all" | "quran" | "hadith" | "tafsir">("all")

  const filteredBookmarks = bookmarks.filter((b) => {
    if (filterType === "all") return true
    return b.source_type === filterType
  })

  const getCollectionLabel = (b: BookmarkItem) => {
    if (b.source_type === "quran") return "Coran"
    if (b.source_type === "tafsir") return "Tafsir Ibn Kathir"
    
    const labels: Record<string, string> = {
      bukhari: "Sahih Bukhari",
      muslim: "Sahih Muslim",
      abu_dawud: "Sunan Abu Dawud",
      tirmidhi: "Jami' al-Tirmidhi",
      nasai: "Sunan al-Nasa'i",
      ibn_majah: "Sunan Ibn Majah",
    }
    return labels[b.collection || ""] || b.collection || "Hadith"
  }

  const getSourceBadgeClass = (type: "quran" | "hadith" | "tafsir") => {
    if (type === "quran") return "bg-amber-500/10 text-amber-300 border-amber-500/20"
    if (type === "hadith") return "bg-blue-500/10 text-blue-300 border-blue-500/20"
    return "bg-purple-500/10 text-purple-300 border-purple-500/20"
  }

  const getReadLink = (b: BookmarkItem) => {
    if (b.source_type === "quran") {
      const parts = b.reference.split(":")
      return `/corpus/quran/${parts[0]}#ayah-${parts[1]}`
    }
    if (b.source_type === "hadith") {
      return `/corpus/hadith/${b.collection}`
    }
    // Tafsir
    const reference = b.reference.replace("ibn-kathir:", "")
    const parts = reference.split(":")
    return `/corpus/tafsir/${b.collection}/${parts[0]}`
  }

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ background: "var(--color-bg)" }}>
      <NavBar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b pb-8" style={{ borderColor: "var(--color-border-soft)" }}>
          <div className="space-y-2">
            <h1 
              className="text-3xl font-light tracking-wide text-white"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Mes Favoris
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Retrouvez ici les versets, hadiths et commentaires que vous avez marqués.
            </p>
          </div>

          {bookmarks.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Voulez-vous vraiment vider tous vos favoris ?")) {
                  clearBookmarks()
                }
              }}
              className="text-xs px-4 py-2 rounded-lg border transition-all text-red-400 border-red-500/20 hover:bg-red-500/10 self-start md:self-center"
            >
              Vider la liste
            </button>
          )}
        </div>

        {bookmarks.length === 0 ? (
          <div className="text-center py-20 border rounded-2xl space-y-6" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center text-white/40">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </div>
            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="text-base font-semibold text-white">Aucun favori enregistré</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                Parcourez le Coran, les recueils de Hadiths ou effectuez une recherche pour ajouter des textes à vos favoris en cliquant sur l&apos;icône de marque-page.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex text-xs font-semibold px-6 py-3 rounded-full transition-all hover:scale-105"
              style={{ background: "var(--color-gold)", color: "#050d07" }}
            >
              Lancer une recherche →
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 border-b pb-4" style={{ borderColor: "var(--color-border-soft)" }}>
              {([
                { key: "all", label: `Tous (${bookmarks.length})` },
                { key: "quran", label: `Coran (${bookmarks.filter(b => b.source_type === "quran").length})` },
                { key: "hadith", label: `Hadiths (${bookmarks.filter(b => b.source_type === "hadith").length})` },
                { key: "tafsir", label: `Tafsir (${bookmarks.filter(b => b.source_type === "tafsir").length})` },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setFilterType(t.key)}
                  className="text-xs px-4 py-2 rounded-full border transition-all"
                  style={{
                    background: filterType === t.key ? "var(--color-gold)" : "transparent",
                    color: filterType === t.key ? "#050d07" : "var(--color-text-muted)",
                    borderColor: filterType === t.key ? "var(--color-gold)" : "rgba(250,247,239,0.12)",
                    fontWeight: filterType === t.key ? 600 : 400,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* List */}
            {filteredBookmarks.length === 0 ? (
              <p className="text-center py-10 text-sm" style={{ color: "var(--color-text-muted)" }}>
                Aucun favori dans cette catégorie.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredBookmarks.map((b) => (
                  <div
                    key={b.id}
                    className="p-6 rounded-xl border flex flex-col justify-between gap-4 transition-all hover:border-amber-500/20"
                    style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider font-semibold ${getSourceBadgeClass(b.source_type)}`}>
                          {b.source_type}
                        </span>
                        <span className="text-xs font-semibold text-white/80">
                          {getCollectionLabel(b)}
                        </span>
                        <span className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
                          {b.reference}
                        </span>
                      </div>

                      <button
                        onClick={() => removeBookmark(b.id)}
                        className="p-1.5 rounded-lg border border-red-500/10 text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Retirer des favoris"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Arabic text */}
                    <p
                      dir="rtl"
                      className="text-xl sm:text-2xl leading-loose text-right font-serif text-amber-100"
                      style={{ fontFamily: "'Amiri', serif" }}
                    >
                      {b.arabic}
                    </p>

                    {/* Translation */}
                    {b.translation && (
                      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                        {b.translation}
                      </p>
                    )}

                    {/* Link */}
                    <div className="flex justify-end pt-2 border-t" style={{ borderColor: "var(--color-border-soft)" }}>
                      <Link
                        href={getReadLink(b)}
                        className="text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1"
                      >
                        <span>Consulter dans le corpus</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
