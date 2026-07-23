import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "À propos",
  description: "Découvrez le projet Bayān, sa note d'intention et limites de responsabilité.",
  alternates: {
    canonical: "/a-propos",
  },
  openGraph: {
    url: "/a-propos",
  }
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://www.bayran.fr" },
          { "@type": "ListItem", "position": 2, "name": "À propos", "item": "https://www.bayran.fr/a-propos" }
        ]
      },
      {
        "@type": "AboutPage",
        "@id": "https://www.bayran.fr/a-propos",
        "url": "https://www.bayran.fr/a-propos",
        "name": "À propos | Bayān",
        "description": "Découvrez la note d'intention, les limites et le formulaire de suggestion pour le projet Bayān.",
        "isPartOf": { "@id": "https://www.bayran.fr/#website" },
        "mainEntity": { "@id": "https://www.bayran.fr/#organization" }
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
