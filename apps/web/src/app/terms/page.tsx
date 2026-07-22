import NavBar from "@/components/NavBar"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  robots: { index: false },
}

const SECTIONS = [
  {
    title: "1. Objet",
    content: `Bayān est un outil de recherche sémantique sur le corpus islamique classique (Coran, Hadith, Tafsir). Il est destiné à un usage académique, éducatif et personnel.

Le service est édité et exploité en tant que service en ligne accessible sur abonnement.`,
  },
  {
    title: "2. Acceptation",
    content: `L'utilisation du service implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.`,
  },
  {
    title: "3. Usages autorisés",
    content: `Vous pouvez utiliser Bayān pour :
— La recherche et l'étude personnelle ou académique
— La préparation de khutbas, cours, conférences
— Le développement d'applications via l'API (plan API)
— La vérification de références primaires

Tout usage commercial de masse, scraping automatisé ou revente des données est interdit.`,
  },
  {
    title: "4. Limitation de responsabilité — domaine religieux",
    content: `IMPORTANT : Bayān est un outil de recherche documentaire. Il ne formule aucune fatwa, aucun avis juridique islamique, aucune interprétation théologique.

Les résultats sont des références vers des sources primaires. L'utilisateur est seul responsable de l'interprétation et de l'application des textes trouvés.

Pour toute question théologique ou juridique, consultez un érudit qualifié.`,
  },
  {
    title: "5. Abonnements et paiements",
    content: `Les abonnements Premium et API sont à renouvellement mensuel automatique. Vous pouvez résilier à tout moment depuis votre dashboard — la résiliation prend effet à la fin de la période en cours.

Aucun remboursement partiel n'est accordé sur la période déjà facturée, sauf obligation légale.`,
  },
  {
    title: "6. Disponibilité",
    content: `Nous nous efforçons de maintenir une disponibilité de 99 % (plan API : SLA 99,9 % garanti). Des maintenances planifiées peuvent occasionner des interruptions brèves, annoncées 24 h à l'avance.`,
  },
  {
    title: "7. Propriété intellectuelle",
    content: `Le corpus islamique (Coran, Hadiths, Tafsirs) est du domaine public. Les textes de traduction inclus sont sous licence ouverte (Creative Commons).

L'interface, les algorithmes de recherche, les embeddings et l'infrastructure sont la propriété exclusive d'Bayān.`,
  },
  {
    title: "8. Résiliation",
    content: `Nous nous réservons le droit de suspendre ou résilier un compte en cas de violation des présentes CGU, notamment en cas d'usage abusif de l'API ou de tentative de contournement des quotas.`,
  },
  {
    title: "9. Droit applicable",
    content: `Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux de Paris sont compétents.`,
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <NavBar />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/" className="text-xs hover:opacity-70 mb-8 inline-block" style={{ color: "var(--color-text-muted)" }}>
          ← Retour
        </Link>
        <h1 className="text-2xl font-bold mb-2">Conditions générales d&apos;utilisation</h1>
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
