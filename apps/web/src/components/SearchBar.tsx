"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { getHistory, addToHistory } from "@/lib/searchHistory"

interface SearchBarProps {
  onSearch: (query: string) => void
  loading: boolean
  debounceMs?: number
  initialValue?: string
}

export default function SearchBar({ onSearch, loading, debounceMs = 0, initialValue = "" }: SearchBarProps) {
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
        className="flex items-center gap-2 rounded-xl px-4 py-3 border"
        style={{ background: "rgba(250,247,239,0.05)", borderColor: "rgba(250,247,239,0.12)" }}
      >
        <span style={{ color: "var(--color-text-muted)", fontSize: "1.1rem" }}>⌕</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Rechercher dans le corpus… (/ pour focus)"
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "var(--color-text)" }}
          dir="auto"
          autoFocus
        />
        {value && (
          <button
            onClick={() => { setValue(""); setHistory(getHistory()); setShowHistory(true); inputRef.current?.focus() }}
            className="text-xs px-1.5 rounded hover:opacity-70"
            style={{ color: "var(--color-text-muted)" }}
            aria-label="Effacer"
          >
            ✕
          </button>
        )}
        <button
          onClick={() => submit(value)}
          disabled={loading || !value.trim()}
          className="px-4 py-1.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
          style={{ background: "var(--color-gold)", color: "#050d07" }}
        >
          {loading ? "…" : "Chercher"}
        </button>
      </div>

      {/* Dropdown historique */}
      {showHistory && history.length > 0 && !value && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-xl border overflow-hidden z-50"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Recherches récentes</span>
            <button
              onClick={() => { addToHistory(""); setHistory([]); setShowHistory(false) }}
              className="text-xs hover:opacity-60"
              style={{ color: "var(--color-text-muted)" }}
            >
              Effacer
            </button>
          </div>
          {history.map((q) => (
            <button
              key={q}
              onMouseDown={(e) => { e.preventDefault(); setValue(q); submit(q) }}
              className="w-full text-left px-4 py-2.5 text-sm hover:opacity-80 flex items-center gap-3 border-t"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
            >
              <span className="text-xs opacity-50">↺</span>
              <span dir="auto">{q}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
