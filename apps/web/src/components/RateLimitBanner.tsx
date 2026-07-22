"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds)
  useEffect(() => {
    if (seconds <= 0) return
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [seconds])
  return seconds
}

interface Props {
  resetIn: number
  upgradeUrl?: string
  onDismiss?: () => void
}

export default function RateLimitBanner({ resetIn, upgradeUrl = "/pricing", onDismiss }: Props) {
  const remaining = useCountdown(resetIn)
  const hh = String(Math.floor(remaining / 3600)).padStart(2, "0")
  const mm = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0")
  const ss = String(remaining % 60).padStart(2, "0")

  return (
    <div
      className="rounded-xl p-4 mb-6 flex items-start justify-between gap-4 text-sm"
      style={{ background: "#2a1a0e", border: "1px solid #7c4a1e", color: "#fcd5a0" }}
      role="alert"
    >
      <div className="flex flex-col gap-1">
        <span className="font-medium">Quota journalier atteint</span>
        <span style={{ color: "#f5c07a" }}>
          Réinitialisation dans{" "}
          <span className="font-mono font-bold">{hh}:{mm}:{ss}</span>
          {" — "}ou{" "}
          <Link
            href={upgradeUrl}
            className="underline hover:opacity-80 transition-opacity"
            style={{ color: "var(--color-gold)" }}
          >
            passer à Premium
          </Link>{" "}
          pour 500 recherches/jour.
        </span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Fermer"
          className="shrink-0 text-lg leading-none hover:opacity-60 transition-opacity"
          style={{ color: "#fcd5a0" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
