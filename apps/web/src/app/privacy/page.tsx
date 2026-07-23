import NavBar from "@/components/NavBar"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    url: "/privacy",
  }
}

const SECTIONS = [
  {
    title: "1. Données collectées",
    content: `Bayān est un service gratuit ne nécessitant aucun compte.
Nous ne collectons aucune donnée personnelle identifiable.

Le seul stockage utilisé est le localStorage de votre navigateur pour conserver votre historique de recherche local — ces données ne quittent jamais votre appareil.`,
  },
  {
    title: "2. Usage des données",
    content: `Les requêtes de recherche sont transmises à notre backend uniquement pour produire les résultats.
Nous ne conservons pas d'historique de recherche côté serveur à des fins de profilage.
Nous ne vendons, ne louons, ni ne partageons aucune donnée avec des tiers.`,
  },
  {
    title: "3. Cookies et stockage local",
    content: `Nous utilisons uniquement le localStorage du navigateur pour l'historique de recherche local.
Ces données sont stockées sur votre appareil uniquement et ne sont jamais transmises à nos serveurs.

Aucun cookie publicitaire ou de tracking tiers n'est déposé.`,
  },
  {
    title: "4. Hébergement",
    content: `Nos serveurs sont situés dans l'Union Européenne.
Les communications sont chiffrées via TLS.`,
  },
  {
    title: "5. Vos droits (RGPD)",
    content: `Puisque nous ne collectons aucune donnée personnelle, aucune demande d'accès ou d'effacement n'est nécessaire.

Pour toute question : privacy@bayran.fr`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <NavBar />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/" className="text-xs hover:opacity-70 mb-8 inline-block" style={{ color: "var(--color-text-muted)" }}>
          ← Retour
        </Link>
        <h1 className="text-2xl font-bold mb-2">Politique de confidentialité</h1>
        <p className="text-xs mb-10" style={{ color: "var(--color-text-muted)" }}>
          Dernière mise à jour : juin 2025
        </p>

        <div className="flex flex-col gap-8">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="font-semibold mb-3">{s.title}</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--color-text-muted)" }}>
                {s.content}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
