import React from "react"
import BackLink from "@/components/BackLink"

export default function Loading() {
  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Header Skeleton */}
      <header
        className="px-6 py-4"
        style={{ background: "#050d07", borderBottom: "1px solid rgba(250,247,239,0.06)" }}
      >
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <BackLink light />
          <div className="flex items-center gap-3 flex-1">
            {/* Source badge skeleton */}
            <div className="h-6 w-24 rounded-full bg-white/5 animate-pulse" />
            {/* Reference skeleton */}
            <div className="h-4 w-16 rounded bg-white/5 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Column: Text Content */}
          <div className="flex flex-col gap-6">
            {/* Arabic Text skeleton container */}
            <div
              className="rounded-xl p-6 border flex flex-col items-end gap-3 min-h-[140px]"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div className="h-8 w-3/4 rounded bg-white/5 animate-pulse" />
              <div className="h-8 w-1/2 rounded bg-white/5 animate-pulse" />
            </div>

            {/* Translation skeleton container */}
            <div
              className="rounded-xl p-6 border flex flex-col gap-3 min-h-[100px]"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-white/5 animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-white/5 animate-pulse" />
            </div>

            {/* textual connections section skeleton */}
            <div className="flex flex-col gap-3">
              <div className="h-4 w-28 rounded bg-white/5 animate-pulse" />
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-lg p-4 border flex flex-col gap-3 min-h-[96px]"
                  style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-16 rounded-full bg-white/5 animate-pulse" />
                    <div className="h-4 w-12 rounded bg-white/5 animate-pulse" />
                  </div>
                  <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Connection Graph Skeleton */}
          <div className="flex flex-col gap-4">
            <div className="h-4 w-36 rounded bg-white/5 animate-pulse" />
            <div
              className="rounded-xl border min-h-[350px] flex items-center justify-center relative overflow-hidden"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 animate-pulse" />
                <div className="w-24 h-4 rounded bg-white/5 animate-pulse" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
