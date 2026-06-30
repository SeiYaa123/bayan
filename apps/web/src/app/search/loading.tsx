export default function SearchLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <div className="h-14 border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }} />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="h-12 rounded-2xl mb-8 animate-pulse" style={{ background: "var(--color-surface)" }} />
        <div className="flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border p-5 flex flex-col gap-3"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div className="flex gap-2">
                <div className="h-5 w-14 rounded-full animate-pulse" style={{ background: "var(--color-surface-2)" }} />
                <div className="h-5 w-24 rounded animate-pulse" style={{ background: "var(--color-surface-2)" }} />
              </div>
              <div className="h-6 w-4/5 rounded animate-pulse" style={{ background: "var(--color-surface-2)" }} />
              <div className="h-4 w-full rounded animate-pulse" style={{ background: "var(--color-border)" }} />
              <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: "var(--color-border)" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
