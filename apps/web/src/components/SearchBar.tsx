"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { getHistory, addToHistory } from "@/lib/searchHistory"

interface SearchBarProps {
  onSearch: (query: string) => void
  loading: boolean
  debounceMs?: number
  initialValue?: string
  light?: boolean
}

export default function SearchBar({ 
  onSearch, 
  loading, 
  debounceMs = 0, 
  initialValue = "", 
  light = false 
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Raccourci clavier : "/" focus le champ de recherche
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  // Ferme la liste au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowHistory(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const submit = (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    addToHistory(trimmed)
    setShowHistory(false)
    onSearch(trimmed)
  }

  const handleChange = (newVal: string) => {
    setValue(newVal)
    if (debounceMs > 0) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => submit(newVal), debounceMs)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      submit(value)
    }
    if (e.key === "Escape") {
      setShowHistory(false)
      inputRef.current?.blur()
    }
  }

  const handleFocus = () => {
    if (!value) {
      setHistory(getHistory())
      setShowHistory(true)
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className={`flex items-center gap-2 px-4 py-3 border transition-all ${
          light 
            ? "rounded-full shadow-lg bg-[#FAF8F5]/95 backdrop-blur-md focus-within:border-[#B88A44] focus-within:ring-2 focus-within:ring-[#B88A44]/15" 
            : "rounded-xl"
        }`}
        style={{ 
          background: light ? undefined : "rgba(250,247,239,0.05)", 
          borderColor: light ? "#D5C8B4" : "rgba(250,247,239,0.12)" 
        }}
      >
        <span 
          style={{ 
            color: light ? "#8C8275" : "var(--color-text-muted)", 
            fontSize: "1.2rem",
            transform: "translateY(-1.2px)"
          }}
        >
          ⌕
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Rechercher dans le corpus… (/ pour focus)"
          className={`flex-1 bg-transparent outline-none text-sm font-medium ${
            light ? "placeholder-[#8C8275] text-[#1A1714]" : "placeholder-[#888888] text-white"
          }`}
          style={{ color: light ? "#1A1714" : "var(--color-text)" }}
          dir="auto"
          autoFocus
        />
        {value && (
          <button
            onClick={() => { setValue(""); setHistory(getHistory()); setShowHistory(true); inputRef.current?.focus() }}
            className="text-xs px-1.5 rounded hover:opacity-70 transition-opacity"
            style={{ color: light ? "#8C8275" : "var(--color-text-muted)" }}
            aria-label="Effacer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          onClick={() => submit(value)}
          disabled={loading || !value.trim()}
          className={`px-4 py-1.5 text-sm font-semibold transition-all disabled:opacity-40 hover:scale-[1.02] ${
            light ? "rounded-full bg-[#B88A44] hover:bg-[#a07638] text-white" : "rounded-lg bg-var(--color-gold) text-[#050d07]"
          }`}
          style={light ? undefined : { background: "var(--color-gold)", color: "#050d07" }}
        >
          {loading ? "…" : "Chercher"}
        </button>
      </div>

      {/* Dropdown historique */}
      {showHistory && history.length > 0 && !value && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border overflow-hidden z-50 shadow-2xl"
          style={{ 
            background: light ? "#FAF8F5" : "var(--color-surface)", 
            borderColor: light ? "#D5C8B4" : "var(--color-border)" 
          }}
        >
          <div 
            className="px-4 py-2.5 flex items-center justify-between border-b"
            style={{ borderColor: light ? "#EFECE6" : "var(--color-border)" }}
          >
            <span className="text-xs font-medium" style={{ color: light ? "#8C8275" : "var(--color-text-muted)" }}>Recherches récentes</span>
            <button
              onClick={() => { addToHistory(""); setHistory([]); setShowHistory(false) }}
              className="text-xs font-semibold hover:opacity-75 transition-opacity"
              style={{ color: light ? "#B88A44" : "var(--color-text-muted)" }}
            >
              Effacer
            </button>
          </div>
          {history.map((q) => (
            <button
              key={q}
              onMouseDown={(e) => { e.preventDefault(); setValue(q); submit(q) }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 border-b last:border-b-0 transition-colors"
              style={{ 
                borderColor: light ? "#EFECE6" : "var(--color-border)", 
                color: light ? "#5A4F42" : "var(--color-text-muted)" 
              }}
            >
              <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span dir="auto" className="font-medium">{q}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
