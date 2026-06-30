import Link from "next/link"

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: "var(--color-bg)" }}
    >
      <p className="arabic-xl shimmer-text mb-6" style={{ display: "block" }}>
        ٤٠٤
      </p>
      <h1 className="text-2xl font-bold mb-3">Page introuvable</h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all hover:opacity-90"
        style={{ background: "var(--color-accent)", color: "#fff" }}
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
