import Link from "next/link"
import Footer from "@/components/Footer"

const SAMPLE_QUERIES = ["رحمة", "patience", "صبر", "justice", "توبة"]

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Coran:  { bg: "rgba(200,157,58,0.10)",  text: "#C89D3A", border: "rgba(200,157,58,0.22)"  },
  Hadith: { bg: "rgba(96,165,250,0.10)",  text: "#60a5fa", border: "rgba(96,165,250,0.22)"  },
  Tafsir: { bg: "rgba(167,139,250,0.10)", text: "#a78bfa", border: "rgba(167,139,250,0.22)" },
  Fiqh:   { bg: "rgba(74,222,128,0.10)",  text: "#4ade80", border: "rgba(74,222,128,0.22)"  },
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
  {
    idx: "04",
    ref: "fiqh:qawa'id:2",
    surah: "Qawâ'id fiqhiyya",
    arabic: "الْمَشَقَّةُ تَجْلِبُ التَّيْسِيرَ",
    fr: "La difficulté appelle l'allègement.",
    highlight: "miséricorde",
    type: "Fiqh",
    searchQ: "رحمة فقه",
  },
]


export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', sans-serif", background: "var(--color-bg)" }}>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50" style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span
              dir="rtl"
              style={{ fontFamily: "'Amiri', serif", fontSize: "1.75rem", fontWeight: 700, color: "var(--color-gold)", lineHeight: 1 }}
            >
              بيان
            </span>
            <span style={{ width: "1px", height: "1.2rem", background: "rgba(200,157,58,0.35)" }} />
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "0.9rem",
                fontWeight: 500,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
              }}
            >
              Bayān
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { href: "/search",        label: "Recherche" },
              { href: "/corpus",        label: "Corpus" },
              { href: "/apprentissage", label: "Apprendre" },
              { href: "/fiqh/compare",  label: "Fiqh" },
              { href: "/evolution",     label: "Évolution" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm transition-colors hover:text-[#C89D3A]"
                style={{ color: "var(--color-text-muted)" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/search"
              className="text-sm px-5 py-2 rounded-lg border transition-colors hover:bg-[#C89D3A]/10"
              style={{ borderColor: "var(--color-gold)", color: "var(--color-text)" }}
            >
              Commencer
            </Link>
          </nav>

          <Link
            href="/search"
            className="md:hidden text-sm px-4 py-1.5 rounded-lg border"
            style={{ borderColor: "var(--color-gold)", color: "var(--color-text)" }}
          >
            Recherche
          </Link>
        </div>
      </header>

      <main>
        {/* ── HERO ── */}
        <section
          style={{
            background: "linear-gradient(to bottom, #030806 0%, #050d07 60%, #081811 100%)",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              maxWidth: "1400px",
              width: "100%",
              margin: "0 auto",
              padding: "0 clamp(1.5rem, 5vw, 5rem) clamp(10rem, 20vw, 18rem)",
            }}
          >
            {/* Marqueur arabe */}
            <p
              dir="rtl"
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: "1.5rem",
                color: "#C89D3A",
                marginBottom: "1.75rem",
                lineHeight: 1,
              }}
            >
              بيان
            </p>

            {/* Titre cinématique — 2 lignes, pleine largeur */}
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: "clamp(2.6rem, 8vw, 10rem)",
                lineHeight: 0.92,
                letterSpacing: "-0.025em",
                color: "#FAF7EF",
                marginBottom: "clamp(2rem, 4vw, 3.5rem)",
              }}
            >
              Explorez le corpus<br />
              <em style={{ fontStyle: "italic", color: "rgba(250,247,239,0.45)" }}>
                islamique.
              </em>
            </h1>

            {/* Ligne or + corpus */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                marginBottom: "clamp(2.5rem, 5vw, 4rem)",
              }}
            >
              <div
                style={{
                  width: "2.5rem",
                  height: "1px",
                  background: "#C89D3A",
                  flexShrink: 0,
                }}
              />
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.72rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(250,247,239,0.35)",
                }}
              >
                Coran &nbsp;·&nbsp; Hadith &nbsp;·&nbsp; Tafsir &nbsp;·&nbsp; Fiqh
              </p>
            </div>

            {/* Barre de recherche */}
            <form
              action="/search"
              method="GET"
              style={{
                maxWidth: "34rem",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(250,247,239,0.06)",
                  border: "1px solid rgba(250,247,239,0.14)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <input
                  name="q"
                  type="text"
                  placeholder="رحمة · miséricorde · mercy…"
                  dir="auto"
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    padding: "1rem 1.25rem",
                    fontSize: "0.9rem",
                    color: "#FAF7EF",
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: "#C89D3A",
                    color: "#050d07",
                    border: "none",
                    padding: "1rem 1.6rem",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    fontFamily: "'Inter', sans-serif",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  →
                </button>
              </div>
            </form>

            {/* Suggestions */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {SAMPLE_QUERIES.map((q) => (
                <Link
                  key={q}
                  href={`/search?q=${encodeURIComponent(q)}`}
                  style={{
                    border: "1px solid rgba(250,247,239,0.10)",
                    color: "rgba(250,247,239,0.28)",
                    borderRadius: "2px",
                    padding: "0.2rem 0.7rem",
                    fontSize: "0.72rem",
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "0.04em",
                  }}
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>
        </section>

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
                    { name: "Tout le corpus", count: "66 000+", active: true },
                    { name: "Coran",  count: "6 236"  },
                    { name: "Hadith", count: "60 000+" },
                    { name: "Tafsir", count: null },
                    { name: "Fiqh",   count: null },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between px-3 py-2.5 text-sm"
                      style={{
                        background: item.active ? "rgba(200,157,58,0.08)" : "transparent",
                        color: item.active ? "#C89D3A" : "rgba(250,247,239,0.38)",
                        fontWeight: item.active ? 500 : 400,
                      }}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            background: item.active ? "#C89D3A" : "transparent",
                            border: `1.5px solid ${item.active ? "#C89D3A" : "rgba(250,247,239,0.15)"}`,
                          }}
                        />
                        {item.name}
                      </span>
                      {item.count && (
                        <span className="text-xs tabular-nums" style={{ color: "rgba(250,247,239,0.22)" }}>
                          {item.count}
                        </span>
                      )}
                    </div>
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
