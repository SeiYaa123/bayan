import NavBar from "@/components/NavBar"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <NavBar />

      <div className="max-w-2xl mx-auto px-6 py-28 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs mb-8"
          style={{
            borderColor: "rgba(200,157,58,0.25)",
            background: "rgba(200,157,58,0.08)",
            color: "var(--color-gold)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          Accès libre
        </div>

        <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
          Bayān est gratuit
        </h1>

        <p
          className="text-lg mb-10 leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}
        >
          Aucun compte, aucune carte bancaire, aucune limite.
          <br />
          Le savoir islamique doit rester accessible à tous.
        </p>

        <div
          className="rounded-2xl border p-8 mb-10 text-left"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <ul className="flex flex-col gap-4">
            {[
              "Recherche sémantique illimitée",
              "Accès Coran + 60 000 hadiths + Tafsir",
              "Graphe de connexions inter-textes",
              "Comparaison inter-madhhabs",
              "Navigation isnad complète",
              "Évolution sémantique mecquoise / médinoise",
              "Analyse des racines trilitères",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm">
                <span style={{ color: "var(--color-accent)" }}>✓</span>
                <span style={{ color: "var(--color-text)" }}>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/search"
          className="inline-flex px-10 py-4 rounded-xl font-semibold text-base transition-opacity hover:opacity-90"
          style={{ background: "var(--color-gold)", color: "#050d07" }}
        >
          Commencer maintenant
        </Link>
      </div>
    </div>
  )
}
