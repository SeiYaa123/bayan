"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: "var(--color-bg)" }}
    >
      <p className="text-5xl mb-6" style={{ color: "var(--color-gold)" }}>⚠</p>
      <h1 className="text-2xl font-bold mb-3">Une erreur est survenue</h1>
      <p className="text-sm mb-8 max-w-sm" style={{ color: "var(--color-text-muted)" }}>
        Quelque chose s&apos;est mal passé. Réessayez ou revenez plus tard.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all hover:opacity-90"
        style={{ background: "var(--color-accent)", color: "#fff" }}
      >
        Réessayer
      </button>
    </div>
  )
}
