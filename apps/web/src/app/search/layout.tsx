import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Recherche",
  description: "Moteur de recherche sémantique du Coran, des Hadiths et de Tafsir.",
  alternates: {
    canonical: "/search",
  },
  openGraph: {
    url: "/search",
  }
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://www.bayran.fr" },
      { "@type": "ListItem", "position": 2, "name": "Recherche", "item": "https://www.bayran.fr/search" }
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
