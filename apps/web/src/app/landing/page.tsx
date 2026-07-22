"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Footer from "@/components/Footer"
import { useBookmark } from "@/context/BookmarkContext"

const SAMPLE_QUERIES = ["رحمة", "patience", "صبر", "justice", "توبة"]

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Coran:  { bg: "rgba(200,157,58,0.10)",  text: "#C89D3A", border: "rgba(200,157,58,0.22)"  },
  Hadith: { bg: "rgba(96,165,250,0.10)",  text: "#60a5fa", border: "rgba(96,165,250,0.22)"  },
  Tafsir: { bg: "rgba(167,139,250,0.10)", text: "#a78bfa", border: "rgba(167,139,250,0.22)" },
}

const MOCK_RESULTS = [
  {
    idx: "01",
    ref: "1:3",
    surah: "Al-Fatiha",
    arabic: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    fr: "Le Tout Miséricordieux, le Très Miséricordieux.",
    highlight: "Miséricordieux",
    type: "Coran",
    searchQ: "رحمة",
  },
  {
    idx: "02",
    ref: "bukhari:6469",
    surah: "Sahih Bukhari",
    arabic: "إِنَّ اللَّهَ كَتَبَ الرَّحْمَةَ عَلَى نَفْسِهِ",
    fr: "Allah a prescrit la miséricorde comme obligation à Lui-même.",
    highlight: "miséricorde",
    type: "Hadith",
    searchQ: "رحمة",
  },
  {
    idx: "03",
    ref: "ibn-kathir:1:1",
    surah: "Tafsir Ibn Kathir",
    arabic: "الرَّحْمَنُ الرَّحِيمُ اسْمَانِ مُشْتَقَّانِ مِنَ الرَّحْمَةِ وَهِيَ صِفَةٌ ثَابِتَةٌ لِلَّهِ تَعَالَى",
    fr: "Ar-Rahmân et Ar-Rahîm sont deux noms dérivés de la miséricorde, attribut divin immuable.",
    highlight: "miséricorde",
    type: "Tafsir",
    searchQ: "رحمة تفسير",
  },
]


export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const { toggleBookmark, isBookmarked } = useBookmark()
  const [dailyData, setDailyData] = useState<{
    ayah: { id: string; reference: string; arabic: string; translation_fr: string; surah_name: string; surah_num: string }
    hadith: { id: string; reference: string; collection: string; arabic: string; translation_fr: string }
  } | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Fetch daily verse & hadith
    fetch("/api/daily")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDailyData(data)
        }
      })
      .catch((e) => console.error(e))

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', sans-serif", background: "var(--color-bg)" }}>

      {/* Moving Logo & Calligraphy Animating on Scroll */}
      <div className="fixed inset-x-0 top-0 z-[60] max-w-7xl mx-auto px-6 h-20 pointer-events-none flex items-center justify-start">
        <Link
          href="/"
          className="transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center pointer-events-auto"
          style={{
            position: scrolled ? "relative" : "absolute",
            left: scrolled ? "0" : "50%",
            top: scrolled ? "0" : "18vh",
            transform: scrolled
              ? "translateX(0) scale(0.42)"
              : "translateX(-50%) scale(1)",
            transformOrigin: scrolled ? "center left" : "center center",
          }}
        >
          <img
            src="/symbole_gold.png"
            alt="Emblème"
            className="h-28 md:h-36 w-auto object-contain transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              height: scrolled ? "96px" : "140px",
            }}
          />
          <span
            className="text-[#C89D3A] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] select-none opacity-80"
            style={{
              fontSize: scrolled ? "16px" : "28px",
              marginLeft: scrolled ? "4px" : "12px",
              marginRight: scrolled ? "4px" : "12px",
              transform: scrolled ? "translateY(-0.5px)" : "translateY(-1px)",
            }}
          >
            ◆
          </span>
          <img
            src="/bayran_text.png"
            alt="Bayran"
            className="h-9 md:h-11 w-auto object-contain transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              height: scrolled ? "36px" : "50px",
              transform: scrolled ? "translateY(0.8px)" : "translateY(1.5px)",
            }}
          />
        </Link>
      </div>

      {/* ── HEADER (Navbar transparente au départ, fond & logo apparaissent au scroll) ── */}
      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          background: scrolled ? "rgba(5, 13, 7, 0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(200,157,58,0.2)" : "1px solid transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Gauche : Logo (Apparition au scroll) */}
          <div className="flex-1 flex justify-start items-center">
            {/* Logo placeholder layout to reserve space in navbar */}
            <div className="h-11 md:h-13 w-36 opacity-0" />
          </div>

          {/* Centre : Menu Nav parfaitement centré */}
          <nav className="hidden md:flex items-center justify-center gap-8 flex-1">
            {[
              { href: "/corpus",        label: "Corpus" },
              { href: "/apprentissage", label: "Apprentissage" },
              { href: "/favoris",       label: "Favoris" },
              { href: "/a-propos",      label: "À propos" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-[#C89D3A]"
                style={{ color: scrolled ? "var(--color-text-muted)" : "rgba(90, 79, 66, 0.9)" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Droite : Bouton d'action CTA */}
          <div className="hidden md:flex flex-1 justify-end items-center">
            <Link
              href="/search"
              className="text-xs font-semibold px-5 py-2.5 rounded-full border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#C89D3A] hover:text-black uppercase tracking-wider hover:scale-105"
              style={{
                borderColor: "var(--color-gold)",
                color: scrolled ? "var(--color-gold)" : "#B88A44",
                background: scrolled ? "rgba(200, 157, 58, 0.1)" : "rgba(250, 248, 245, 0.6)",
              }}
            >
              Rechercher →
            </Link>
          </div>

          {/* Mobile CTA */}
          <Link
            href="/search"
            className="md:hidden text-xs px-3.5 py-1.5 rounded-full border font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
            style={{ borderColor: "var(--color-gold)", color: scrolled ? "var(--color-text)" : "#1A1714" }}
          >
            Recherche
          </Link>
        </div>
      </header>

      <main>
        {/* ── HERO (FULLSCREEN 100VH) ── */}
        <section
          className="relative w-full min-h-screen flex flex-col justify-between items-center pt-24 pb-8 px-6 overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/fondhero.png')",
          }}
        >
          {/* Main Hero Content (Centré verticalement) */}
          <div className="relative max-w-5xl mx-auto text-center z-10 my-auto w-full">
            {/* Emblem spacer placeholder to maintain vertical layout alignment */}
            <div className="h-[200px] mb-4 pointer-events-none opacity-0" />


            {/* Barre de recherche centrale (Bulle arrondie) */}
            <form
              action="/search"
              method="GET"
              className="w-full max-w-2xl mx-auto bg-[#FAF8F5]/95 backdrop-blur-md p-2 pl-7 rounded-full shadow-2xl border border-[#D5C8B4] flex items-center gap-3 transition-all focus-within:border-[#B88A44] focus-within:ring-2 focus-within:ring-[#B88A44]/20"
            >
              <input
                name="q"
                type="text"
                placeholder="Rechercher un article, une vidéo, un thème..."
                dir="auto"
                className="flex-1 bg-transparent py-2.5 text-[#1A1714] placeholder-[#8C8275] outline-none text-sm md:text-base font-medium"
              />
              <button
                type="submit"
                aria-label="Rechercher"
                className="w-11 h-11 rounded-full bg-[#B88A44] hover:bg-[#a07638] text-white flex items-center justify-center transition-all shadow-md shrink-0 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* Suggestions de recherche rapide */}
            <div className="mt-4 flex flex-wrap justify-center items-center gap-2">
              <span className="text-xs text-[#6B6155] font-medium mr-1">Exemples :</span>
              {SAMPLE_QUERIES.map((q) => (
                <Link
                  key={q}
                  href={`/search?q=${encodeURIComponent(q)}`}
                  className="bg-white/60 hover:bg-white text-[#5A4F42] border border-[#D5C8B4] rounded-full px-3 py-1 text-xs transition-all shadow-sm"
                >
                  {q}
                </Link>
              ))}
            </div>


          </div>

          {/* Indication de Scroll (Animated mouse pill + indicator) */}
          <div
            className="relative z-10 flex flex-col items-center gap-1.5 transition-all duration-500 cursor-pointer mt-4"
            style={{
              opacity: scrolled ? 0 : 1,
              transform: scrolled ? "translateY(20px)" : "translateY(0)",
              pointerEvents: scrolled ? "none" : "auto",
            }}
            onClick={() => {
              window.scrollTo({ top: window.innerHeight - 70, behavior: 'smooth' })
            }}
          >
            <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-[#5A4F42]">
              Explorer
            </span>
            <div className="w-6 h-10 rounded-full border-2 border-[#B88A44]/50 flex justify-center p-1 bg-white/30 backdrop-blur-xs">
              <div className="w-1.5 h-3 bg-[#B88A44] rounded-full animate-bounce mt-1" />
            </div>
          </div>
        </section>

        {/* ── SECTION DÉCOUVERTE DU JOUR (Verset & Hadith) ── */}
        {dailyData && (
          <section className="relative max-w-7xl mx-auto px-6 py-16 border-t" style={{ borderColor: "rgba(250,247,239,0.06)" }}>
            <div className="text-center space-y-2 mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-200/50">
                Méditation Quotidienne
              </span>
              <h2 className="text-2xl md:text-3xl font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Mis en avant aujourd&apos;hui
              </h2>
              <div className="w-10 h-0.5 bg-amber-500/30 mx-auto" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Card 1: Verset du Jour */}
              <div 
                className="p-8 rounded-xl border flex flex-col justify-between gap-6 transition-all hover:border-amber-500/20"
                style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded border border-amber-500/20 bg-amber-500/10 text-amber-300 uppercase tracking-wider font-semibold">
                      Coran
                    </span>
                    <span className="text-xs font-medium text-white/80">
                      Sourate {dailyData.ayah.surah_name} ({dailyData.ayah.surah_num})
                    </span>
                  </div>
                  
                  <button
                    onClick={() => toggleBookmark({
                      id: dailyData.ayah.id,
                      source_type: "quran",
                      reference: dailyData.ayah.reference,
                      arabic: dailyData.ayah.arabic,
                      translation: dailyData.ayah.translation_fr
                    })}
                    className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                    title={isBookmarked(dailyData.ayah.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                    style={{ color: isBookmarked(dailyData.ayah.id) ? "var(--color-gold)" : "var(--color-text-muted)" }}
                  >
                    <svg className="w-4 h-4" fill={isBookmarked(dailyData.ayah.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                  </button>
                </div>

                <p 
                  dir="rtl" 
                  className="text-2xl sm:text-3xl leading-loose text-right text-amber-100 font-serif"
                  style={{ fontFamily: "'Amiri', serif" }}
                >
                  {dailyData.ayah.arabic}
                </p>

                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {dailyData.ayah.translation_fr}
                </p>

                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--color-border-soft)" }}>
                  <span className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
                    Verset {dailyData.ayah.reference}
                  </span>
                  <Link
                    href={`/corpus/quran/${dailyData.ayah.surah_num}#ayah-${dailyData.ayah.reference.split(":")[1]}`}
                    className="text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors"
                  >
                    Lire dans la sourate →
                  </Link>
                </div>
              </div>

              {/* Card 2: Hadith du Jour */}
              <div 
                className="p-8 rounded-xl border flex flex-col justify-between gap-6 transition-all hover:border-amber-500/20"
                style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 text-blue-300 uppercase tracking-wider font-semibold">
                      Hadith
                    </span>
                    <span className="text-xs font-medium text-white/80">
                      Recueil : {dailyData.hadith.collection}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleBookmark({
                      id: dailyData.hadith.id,
                      source_type: "hadith",
                      reference: dailyData.hadith.reference,
                      collection: dailyData.hadith.collection,
                      arabic: dailyData.hadith.arabic,
                      translation: dailyData.hadith.translation_fr
                    })}
                    className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                    title={isBookmarked(dailyData.hadith.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                    style={{ color: isBookmarked(dailyData.hadith.id) ? "var(--color-gold)" : "var(--color-text-muted)" }}
                  >
                    <svg className="w-4 h-4" fill={isBookmarked(dailyData.hadith.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                  </button>
                </div>

                <p 
                  dir="rtl" 
                  className="text-xl sm:text-2xl leading-loose text-right text-amber-100 font-serif"
                  style={{ fontFamily: "'Amiri', serif" }}
                >
                  {dailyData.hadith.arabic}
                </p>

                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {dailyData.hadith.translation_fr}
                </p>

                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--color-border-soft)" }}>
                  <span className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
                    Référence : {dailyData.hadith.reference}
                  </span>
                  <Link
                    href={`/corpus/hadith/${dailyData.hadith.collection}`}
                    className="text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors"
                  >
                    Parcourir le recueil →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── ZONE DE RÉSULTATS (démo) ── */}
        <section style={{ borderTop: "1px solid rgba(250,247,239,0.06)" }}>
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="flex flex-col md:flex-row gap-10">

              {/* Sidebar filtres */}
              <aside className="w-full md:w-60 shrink-0">
                <h2
                  className="text-xs uppercase tracking-[0.2em] mb-6"
                  style={{ color: "rgba(250,247,239,0.30)" }}
                >
                  Filtrer par corpus
                </h2>

                <nav className="space-y-0.5">
                  {[
                    { name: "Tout le corpus", count: "66 000+", active: true, href: "/search?q=%D8%B1%D8%AD%D9%85%D8%A9" },
                    { name: "Coran",  count: "6 236", active: false, href: "/search?q=%D8%B1%D8%AD%D9%85%D8%A9&types=quran" },
                    { name: "Hadith", count: "60 000+", active: false, href: "/search?q=%D8%B1%D8%AD%D9%85%D8%A9&types=hadith" },
                    { name: "Tafsir", count: null, active: false, href: "/search?q=%D8%B1%D8%AD%D9%85%D8%A9&types=tafsir" },
                  ].map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center justify-between px-3 py-2.5 text-sm rounded transition-all duration-300 hover:bg-[rgba(200,157,58,0.05)] hover:text-[#C89D3A] group/filter"
                      style={{
                        background: item.active ? "rgba(200,157,58,0.08)" : "transparent",
                        color: item.active ? "#C89D3A" : "rgba(250,247,239,0.38)",
                        fontWeight: item.active ? 500 : 400,
                      }}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0 transition-colors duration-300 group-hover/filter:bg-[#C89D3A] group-hover/filter:border-[#C89D3A]"
                          style={{
                            background: item.active ? "#C89D3A" : "transparent",
                            border: `1.5px solid ${item.active ? "#C89D3A" : "rgba(250,247,239,0.15)"}`,
                          }}
                        />
                        {item.name}
                      </span>
                      {item.count && (
                        <span className="text-xs tabular-nums opacity-60 group-hover/filter:text-[#C89D3A] transition-colors" style={{ color: "rgba(250,247,239,0.22)" }}>
                          {item.count}
                        </span>
                      )}
                    </Link>
                  ))}
                </nav>
              </aside>

              {/* Résultats */}
              <div className="flex-1">
                <div
                  className="flex items-center justify-between mb-8 pb-5 border-b"
                  style={{ borderColor: "rgba(250,247,239,0.08)" }}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm" style={{ color: "rgba(250,247,239,0.55)" }}>
                      <span className="font-bold" style={{ color: "#FAF7EF" }}>43 résultats</span> pour
                    </p>
                    <span
                      className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold border"
                      style={{
                        background: "rgba(200,157,58,0.10)",
                        color: "#C89D3A",
                        borderColor: "rgba(200,157,58,0.22)",
                        borderRadius: "2px",
                      }}
                    >
                      رحمة
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: "rgba(250,247,239,0.28)" }}>Pertinence ▾</span>
                </div>

                <div className="space-y-4">
                  {MOCK_RESULTS.map((r) => {
                    const tc = TYPE_COLORS[r.type] ?? TYPE_COLORS.Hadith
                    return (
                    <article
                      key={r.idx}
                      className="p-7 border transition-all"
                      style={{
                        background: "rgba(250,247,239,0.02)",
                        borderColor: "rgba(250,247,239,0.07)",
                        borderRadius: "2px",
                      }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <span
                            className="text-xs font-bold tabular-nums"
                            style={{ color: "rgba(250,247,239,0.18)", letterSpacing: "-0.02em" }}
                          >
                            {r.idx}
                          </span>
                          <div className="h-px w-5" style={{ background: "rgba(250,247,239,0.10)" }} />
                          <span
                            className="text-xs font-bold uppercase"
                            style={{ color: "#C89D3A", letterSpacing: "0.12em" }}
                          >
                            {r.ref} — {r.surah}
                          </span>
                        </div>
                        <span
                          className="text-xs px-2 py-0.5"
                          style={{
                            background: tc.bg,
                            color: tc.text,
                            border: `1px solid ${tc.border}`,
                            borderRadius: "2px",
                          }}
                        >
                          {r.type}
                        </span>
                      </div>

                      <div className="space-y-5">
                        {/* Texte arabe */}
                        <p
                          className="text-right text-3xl leading-loose"
                          dir="rtl"
                          style={{ fontFamily: "'Amiri', serif", color: "#C89D3A" }}
                        >
                          {r.arabic}
                        </p>

                        {/* Traduction française */}
                        <p
                          className="leading-relaxed italic"
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: "rgba(250,247,239,0.55)",
                            fontSize: "1.08rem",
                          }}
                        >
                          {r.fr.split(r.highlight).map((part, i, arr) => (
                            <span key={i}>
                              {part}
                              {i < arr.length - 1 && (
                                <mark
                                  style={{
                                    background: "rgba(200,157,58,0.20)",
                                    color: "#C89D3A",
                                    fontWeight: 600,
                                    padding: "0 3px",
                                    borderRadius: "2px",
                                    fontStyle: "normal",
                                  }}
                                >
                                  {r.highlight}
                                </mark>
                              )}
                            </span>
                          ))}
                        </p>
                      </div>

                      <div
                        className="mt-5 pt-4 border-t flex items-center gap-4"
                        style={{ borderColor: "rgba(250,247,239,0.06)" }}
                      >
                        <Link
                          href={`/search?q=${encodeURIComponent(r.searchQ)}`}
                          className="text-xs font-medium transition-opacity hover:opacity-70"
                          style={{ color: tc.text }}
                        >
                          Rechercher dans le corpus →
                        </Link>
                      </div>
                    </article>
                    )
                  })}
                </div>

                <div className="mt-10 text-center">
                  <Link
                    href="/search?q=%D8%B1%D8%AD%D9%85%D8%A9"
                    className="px-10 py-4 border text-xs font-bold uppercase tracking-[0.2em] transition-all hover:opacity-70"
                    style={{ borderColor: "rgba(250,247,239,0.12)", color: "rgba(250,247,239,0.40)", borderRadius: "2px" }}
                  >
                    Voir tous les résultats
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  )
}
