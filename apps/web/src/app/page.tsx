import LandingPage from "./landing/page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
  }
}

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.bayran.fr/#organization",
        "name": "Bayān",
        "url": "https://www.bayran.fr",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.bayran.fr/bayran_text.png"
        },
        "description": "Moteur de recherche sémantique du Coran, de plus de 60 000 hadiths et du tafsir Ibn Kathir, en arabe, français et anglais."
      },
      {
        "@type": "WebSite",
        "@id": "https://www.bayran.fr/#website",
        "url": "https://www.bayran.fr",
        "name": "Bayān",
        "description": "Recherche sémantique islamique — Coran, hadiths et tafsir.",
        "publisher": { "@id": "https://www.bayran.fr/#organization" },
        "inLanguage": "fr",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://www.bayran.fr/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  )
}
