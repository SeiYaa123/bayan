"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { search, type SearchResult } from "@/lib/api"
import { addToHistory } from "@/lib/searchHistory"
import SearchBar from "@/components/SearchBar"
import ResultCard from "@/components/ResultCard"
import FilterBar from "@/components/FilterBar"
import NavBar from "@/components/NavBar"

const PAGE_SIZE = 20

const SAMPLE_QUERIES = [
  { ar: "رحمة",  fr: "miséricorde" },
  { ar: "صبر",   fr: "patience" },
  { ar: "زكاة",  fr: "aumône" },
  { ar: "وحي",   fr: "révélation" },
  { ar: "توبة",  fr: "repentir" },
]

export default function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialQuery = searchParams.get("q") ?? ""
  const initialTypes = searchParams.getAll("types")

  const [results, setResults] = useState<SearchResult[]>([])
  const [query, setQuery] = useState(initialQuery)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTypes, setActiveTypes] = useState<string[]>(initialTypes)
  const [searched, setSearched] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const offsetRef = useRef(0)
  const currentQueryRef = useRef(initialQuery)
  const lastSearchedRef = useRef({ q: "", types: [] as string[] })

  const pushUrl = useCallback((q: string, types: string[]) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    types.forEach((t) => params.append("types", t))
    const qs = params.toString()
    const targetUrl = `/search${qs ? `?${qs}` : ""}`
    if (typeof window !== "undefined" && window.location.search !== (qs ? `?${qs}` : "")) {
      router.replace(targetUrl, { scroll: false })
    }
  }, [router])

  const runSearch = useCallback(async (q: string, types: string[]) => {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    setQuery(q)
    setSearched(true)
    setResults([])
    setTotal(0)
    offsetRef.current = 0
    currentQueryRef.current = q
    lastSearchedRef.current = { q, types }
    addToHistory(q)
    pushUrl(q, types)
    try {
      const res = await search(q, types, PAGE_SIZE, 0)
      setResults(res.results)
      setTotal(res.total)
      setHasMore(res.results.length === PAGE_SIZE)
      offsetRef.current = PAGE_SIZE
    } catch {
      setError("Impossible de joindre l'API. Vérifiez que le backend est démarré.")
    } finally {
      setLoading(false)
    }
  }, [pushUrl])

  useEffect(() => {
    const serializedTypes = initialTypes.join(",")
    const lastSerializedTypes = lastSearchedRef.current.types.join(",")

    if (
      initialQuery &&
      (initialQuery !== lastSearchedRef.current.q || serializedTypes !== lastSerializedTypes)
    ) {
      lastSearchedRef.current = { q: initialQuery, types: initialTypes }
      runSearch(initialQuery, initialTypes)
    }
  }, [initialQuery, initialTypes, runSearch])

  const handleLoadMore = async () => {
    if (loadingMore || !currentQueryRef.current) return
    setLoadingMore(true)
    try {
      const res = await search(currentQueryRef.current, activeTypes, PAGE_SIZE, offsetRef.current)
      setResults((prev) => [...prev, ...res.results])
      setHasMore(res.results.length === PAGE_SIZE)
      offsetRef.current += PAGE_SIZE
    } catch {
      setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleTypeChange = (types: string[]) => {
    setActiveTypes(types)
    if (searched && currentQueryRef.current) {
      runSearch(currentQueryRef.current, types)
    }
  }

  /* ── État pré-recherche ── */
  if (!searched) {
    return (
      <main 
        className="min-h-screen flex flex-col justify-between"
        style={{ background: "var(--color-bg)" }}
      >
        <NavBar transparentOnTop />

        {/* Hero Section */}
        <section
          className="relative w-full flex-grow flex flex-col justify-center items-center pt-28 pb-12 px-6 overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/fondhero.webp')",
          }}
        >
          {/* Main Hero Content */}
          <div className="relative max-w-5xl mx-auto text-center z-10 w-full flex flex-col items-center gap-6">
            
            {/* Logo Calligraphie */}
            <div className="flex items-center justify-center">
              <img
                src="/symbole_gold.png"
                alt="Emblème"
                className="h-28 md:h-36 w-auto object-contain"
              />
              <span className="text-[#C89D3A] text-lg md:text-2xl mx-3 select-none">◆</span>
              <img
                src="/bayran_text.png"
                alt="Bayran"
                className="h-9 md:h-11 w-auto object-contain"
                style={{ transform: "translateY(1.5px)" }}
              />
            </div>

            <p 
              className="text-xs uppercase tracking-[0.25em] font-medium"
              style={{ color: "rgba(90, 79, 66, 0.8)" }}
            >
              Moteur de recherche unifié (Coran, Hadiths, Tafsir)
            </p>

            {/* Central Search Bar */}
            <div className="w-full max-w-2xl mt-4">
              <SearchBar
                onSearch={(q) => runSearch(q, activeTypes)}
                loading={loading}
                initialValue={initialQuery}
                light
              />
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              <span className="text-xs font-semibold mr-1 self-center" style={{ color: "rgba(90, 79, 66, 0.8)" }}>Exemples :</span>
              {SAMPLE_QUERIES.map((q) => (
                <button
                  key={q.ar}
                  onClick={() => runSearch(q.ar, activeTypes)}
                  className="px-4 py-1.5 rounded-full text-xs border transition-all shadow-sm"
                  style={{ 
                    borderColor: "#D5C8B4", 
                    color: "#5A4F42", 
                    background: "rgba(250, 248, 245, 0.7)" 
                  }}
                >
                  <span className="font-serif mr-1">{q.ar}</span>
                  <span className="opacity-70">— {q.fr}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    )
  }

  /* ── Mise en page post-recherche ── */
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>
      <NavBar />
      <div className="flex flex-1" style={{ minHeight: 0 }}>
      {/* Barre latérale */}
      <aside
        className="hidden md:block w-60 shrink-0 border-r"
        style={{
          background: "var(--color-surface-2)",
          borderColor: "var(--color-border)",
          position: "sticky",
          top: "80px",
          height: "calc(100vh - 80px)",
          overflowY: "auto",
        }}
      >
        <FilterBar activeTypes={activeTypes} onChange={handleTypeChange} />
      </aside>

      {/* Zone principale */}
      <main className="flex-1 min-w-0" style={{ background: "var(--color-bg)" }}>
        {/* En-tête compact avec recherche */}
        <div
          className="sticky top-20 z-10 border-b"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div className="px-6 py-4 flex items-center gap-3">
            <div className="flex-1">
              <SearchBar
                onSearch={(q) => runSearch(q, activeTypes)}
                loading={loading}
                initialValue={query}
              />
            </div>
            <button
              onClick={() => setMobileFiltersOpen((o) => !o)}
              className="md:hidden flex-shrink-0 px-3 py-2 rounded-lg border text-xs"
              style={{
                borderColor: mobileFiltersOpen ? "var(--color-gold)" : "var(--color-border)",
                color: mobileFiltersOpen ? "var(--color-gold)" : "var(--color-text-muted)",
                background: "var(--color-surface-2)",
              }}
            >
              Filtres{activeTypes.length > 0 ? ` (${activeTypes.length})` : ""}
            </button>
          </div>
          {mobileFiltersOpen && (
            <div className="md:hidden border-t px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
              <FilterBar activeTypes={activeTypes} onChange={handleTypeChange} />
            </div>
          )}
        </div>

        {/* Résultats */}
        <div className="px-6 sm:px-10 py-8 max-w-3xl">
          {/* Méta + partage */}
          {(results.length > 0 || total > 0) && (
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {total > 0 ? total : results.length} résultats pour{" "}
                <span style={{ color: "var(--color-text)" }}>« {query} »</span>
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="text-xs px-3 py-1 rounded-lg border transition-opacity hover:opacity-70"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
              >
                Partager
              </button>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div
              className="p-5 mb-6 text-sm border"
              style={{
                background: "rgba(250,247,239,0.03)",
                color: "rgba(250,247,239,0.50)",
                borderColor: "rgba(250,247,239,0.08)",
                borderRadius: "2px",
                lineHeight: 1.7,
              }}
            >
              Service temporairement indisponible — veuillez démarrer le backend ou réessayer dans un moment.
            </div>
          )}

          {/* Vide */}
          {searched && !loading && results.length === 0 && !error && (
            <p className="py-16 text-center" style={{ color: "var(--color-text-muted)" }}>
              Aucun résultat pour « {query} »
            </p>
          )}

          {/* Squelette de chargement */}
          {loading && (
            <div className="flex flex-col gap-0">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="py-6 border-b animate-pulse"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div
                    className="h-3 w-32 rounded mb-3"
                    style={{ background: "var(--color-border)" }}
                  />
                  <div
                    className="h-8 w-3/4 rounded mb-2"
                    style={{ background: "var(--color-border)" }}
                  />
                  <div
                    className="h-3 w-1/2 rounded"
                    style={{ background: "var(--color-surface-2)" }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Liste des résultats */}
          {!loading && results.length > 0 && (
            <div>
              {results.map((r, i) => (
                <ResultCard key={r.id} result={r} index={i + 1} />
              ))}

              {/* Charger plus */}
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 rounded-xl font-medium text-sm border transition-opacity hover:opacity-70 disabled:opacity-40"
                    style={{
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {loadingMore ? "Chargement…" : "Charger plus de résultats"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
    </main>
  )
}
