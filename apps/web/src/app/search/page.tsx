"use client"

import { Suspense } from "react"
import SearchContent from "./SearchContent"
import NavBar from "@/components/NavBar"

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>
          <div className="flex-1 flex items-center justify-center">
            <div
              className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
            />
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
