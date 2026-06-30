"use client"

import { useRouter } from "next/navigation"

interface BackLinkProps {
  /** Use on dark (emerald) backgrounds */
  light?: boolean
}

export default function BackLink({ light }: BackLinkProps) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="text-sm hover:opacity-70 transition-opacity"
      style={{ color: "rgba(250,247,239,0.65)" }}
    >
      ← Retour
    </button>
  )
}
