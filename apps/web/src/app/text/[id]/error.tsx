"use client"

import React, { useEffect } from "react"
import Link from "next/link"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to console
    console.error("Text detail page error:", error)
  }, [error])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 text-center" style={{ background: "var(--color-bg)" }}>
      <p
        dir="rtl"
        style={{
          fontFamily: "'Amiri', serif",
          fontSize: "clamp(3rem, 10vw, 6rem)",
          color: "rgba(250,247,239,0.06)",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        خطر
      </p>

      <div className="max-w-md">
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.75rem",
            fontWeight: 400,
            color: "var(--color-gold)",
            marginBottom: "0.75rem",
          }}
        >
          Une erreur est survenue
        </h1>
        <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          Quelque chose s&apos;est mal passé lors de la récupération des détails de ce texte. 
          Veuillez réessayer ou revenir à la recherche.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-transform hover:scale-105 active:scale-95"
          style={{ background: "var(--color-gold)", color: "#050d07" }}
        >
          Réessayer
        </button>
        <Link
          href="/search"
          className="px-6 py-2.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-transform hover:scale-105 active:scale-95"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          Rechercher
        </Link>
      </div>
    </main>
  )
}
