import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mes Favoris",
  description: "Retrouvez vos versets, hadiths et commentaires favoris enregistrés.",
  alternates: {
    canonical: "/favoris",
  },
  openGraph: {
    url: "/favoris",
  }
}

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://www.bayran.fr" },
      { "@type": "ListItem", "position": 2, "name": "Favoris", "item": "https://www.bayran.fr/favoris" }
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
