import Link from "next/link"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { getHadithCollection, type Hadith } from "@/lib/api"
import type { Metadata } from "next"
import TextDetailActions from "@/components/TextDetailActions"

import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ collection: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateStaticParams() {
  return [
    { collection: "bukhari" },
    { collection: "muslim" },
  ]
}

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params
  if (collection !== "bukhari" && collection !== "muslim") {
    notFound()
  }
  const names: Record<string, string> = {
    bukhari: "Sahih al-Bukhari",
    muslim: "Sahih Muslim",
  }
  const colName = names[collection] || collection
  return {
    title: `Hadiths — ${colName}`,
    description: `Parcourez et lisez la collection de Hadiths de ${colName} avec les chaînes de transmission et commentaires.`,
    alternates: {
      canonical: `/corpus/hadith/${collection}`,
    },
    openGraph: {
      url: `/corpus/hadith/${collection}`,
    }
  }
}

const PAGE_SIZE = 50

export default async function HadithCollectionPage({ params, searchParams }: Props) {
  const { collection } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10))
  const offset = (page - 1) * PAGE_SIZE

  if (collection !== "bukhari" && collection !== "muslim") {
    notFound()
  }

  let data: Awaited<ReturnType<typeof getHadithCollection>> | null = null
  try {
    data = await getHadithCollection(collection, PAGE_SIZE, offset)
  } catch {
    notFound()
  }

  const totalPages = Math.ceil(data.total / PAGE_SIZE)

  // Breadcrumb schema
  const breadcrumbJson = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://www.bayran.fr" },
      { "@type": "ListItem", "position": 2, "name": "Corpus", "item": "https://www.bayran.fr/corpus" },
      { "@type": "ListItem", "position": 3, "name": "Hadith", "item": "https://www.bayran.fr/corpus" },
      { "@type": "ListItem", "position": 4, "name": data.label, "item": `https://www.bayran.fr/corpus/hadith/${collection}` }
    ]
  }

  // Book/Collection schema
  const bookJson = {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `https://www.bayran.fr/corpus/hadith/${collection}`,
    "name": data.label,
    "inLanguage": ["ar", "fr"],
    "author": {
      "@type": "Person",
      "name": collection === "bukhari" ? "Muhammad al-Bukhari" : "Muslim ibn al-Hajjaj"
    },
    "description": `Recueil de Hadiths compilé par l'imam ${collection === "bukhari" ? "al-Bukhari" : "Muslim"}.`
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJson) }}
      />
      <NavBar />

      {/* Header */}
      <header
        className="sticky top-[61px] z-40 px-6 py-4"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          {/* Breadcrumb component */}
          <div className="flex items-center gap-2 text-xs text-[rgba(250,247,239,0.45)]">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/corpus" className="hover:text-white transition-colors">Corpus</Link>
            <span>/</span>
            <span className="text-[rgba(250,247,239,0.7)]">{data.label}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/corpus" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "rgba(250,247,239,0.65)" }}>
              ← Corpus
            </Link>
            <span style={{ width: "1px", height: "1rem", background: "var(--color-border)" }} />
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.1rem",
                fontWeight: 400,
                color: "var(--color-text)",
              }}
            >
              {data.label}
            </h1>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginLeft: "auto" }}>
              {data.total.toLocaleString("fr-FR")} hadiths
            </span>
          </div>
        </div>
      </header>

      {/* Hadith list */}
      <main className="max-w-4xl mx-auto px-6 pt-6 pb-8 flex flex-col gap-0">
        {data.hadiths.map((h: Hadith) => (
          <HadithRow key={h.id} hadith={h} collection={collection} />
        ))}
      </main>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="border-t px-6 py-6"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/corpus/hadith/${collection}?page=${page - 1}`}
                  className="px-4 py-2 rounded-lg border text-sm transition-colors hover:border-[rgba(200,157,58,0.4)]"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
                >
                  ← Précédent
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/corpus/hadith/${collection}?page=${page + 1}`}
                  className="px-4 py-2 rounded-lg border text-sm transition-colors hover:border-[rgba(200,157,58,0.4)]"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
                >
                  Suivant →
                </Link>
              )}
            </div>

            <PageLinks collection={collection} currentPage={page} totalPages={totalPages} />

            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              Page {page} / {totalPages}
            </span>
          </div>
        </nav>
      )}
      <Footer />
    </div>
  )
}

function HadithRow({ hadith, collection }: { hadith: Hadith; collection: string }) {
  const grades: Array<{ who?: string; grade?: string }> = Array.isArray(hadith.metadata?.grades)
    ? (hadith.metadata.grades as Array<{ who?: string; grade?: string }>)
    : []
  const mainGrade = grades[0]

  const hadithNum = hadith.reference.includes(":")
    ? hadith.reference.slice(hadith.reference.lastIndexOf(":") + 1)
    : hadith.id

  return (
    <div
      id={`hadith-${hadithNum}`}
      className="group border-b py-8 flex flex-col gap-4 scroll-mt-32 target:bg-[rgba(200,157,58,0.05)] target:rounded-lg target:px-4 target:-mx-4 transition-colors"
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Reference + grade */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "0.7rem",
            color: "var(--color-gold)",
            background: "rgba(200,157,58,0.08)",
            padding: "0.2rem 0.55rem",
            borderRadius: "4px",
          }}
        >
          {hadith.reference}
        </span>
        {mainGrade?.grade ? (
          <span
            style={{
              fontSize: "0.65rem",
              color: "var(--color-text-muted)",
              background: "rgba(250,247,239,0.05)",
              padding: "0.15rem 0.45rem",
              borderRadius: "4px",
            }}
          >
            {mainGrade.grade}{mainGrade.who ? ` · ${mainGrade.who}` : ""}
          </span>
        ) : (
          <span
            style={{
              fontSize: "0.65rem",
              color: "#C89D3A",
              background: "rgba(200,157,58,0.1)",
              padding: "0.15rem 0.45rem",
              borderRadius: "4px",
              border: "1px solid rgba(200,157,58,0.2)",
              fontWeight: 600
            }}
          >
            Sahih (Authentique)
          </span>
        )}
      </div>

      {/* Arabic */}
      <p
        dir="rtl"
        style={{
          fontFamily: "'Amiri', serif",
          fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
          color: "var(--color-text)",
          lineHeight: 2,
          textAlign: "right",
        }}
      >
        {hadith.arabic}
      </p>

      {/* English translation */}
      {(hadith.translation_fr ?? hadith.translation_en) && (
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--color-text-muted)",
            lineHeight: 1.75,
            maxWidth: "680px",
            borderLeft: "2px solid rgba(200,157,58,0.2)",
            paddingLeft: "1rem",
          }}
        >
          {hadith.translation_fr ?? hadith.translation_en}
        </p>
      )}

      {/* Actions */}
      <div className="mt-2.5 flex justify-start">
        <TextDetailActions
          id={hadith.id}
          source_type="hadith"
          reference={hadith.reference}
          collection={collection}
          arabic={hadith.arabic}
          translation={hadith.translation_fr ?? hadith.translation_en ?? undefined}
        />
      </div>
    </div>
  )
}

function PageLinks({ collection, currentPage, totalPages }: {
  collection: string
  currentPage: number
  totalPages: number
}) {
  const pages: number[] = []
  const delta = 2
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center gap-1">
      {currentPage > delta + 1 && (
        <>
          <PageLink collection={collection} page={1} current={currentPage} />
          {currentPage > delta + 2 && <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>…</span>}
        </>
      )}
      {pages.map((p) => (
        <PageLink key={p} collection={collection} page={p} current={currentPage} />
      ))}
      {currentPage < totalPages - delta && (
        <>
          {currentPage < totalPages - delta - 1 && <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>…</span>}
          <PageLink collection={collection} page={totalPages} current={currentPage} />
        </>
      )}
    </div>
  )
}

function PageLink({ collection, page, current }: { collection: string; page: number; current: number }) {
  const isActive = page === current
  return (
    <Link
      href={`/corpus/hadith/${collection}?page=${page}`}
      className="w-8 h-8 flex items-center justify-center rounded text-xs transition-colors"
      style={{
        background: isActive ? "rgba(200,157,58,0.15)" : "transparent",
        color: isActive ? "var(--color-gold)" : "var(--color-text-muted)",
        border: isActive ? "1px solid rgba(200,157,58,0.3)" : "1px solid transparent",
      }}
    >
      {page}
    </Link>
  )
}

function NotFound({ collection }: { collection: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6" style={{ background: "var(--color-bg)" }}>
      <p
        dir="rtl"
        style={{ fontFamily: "'Amiri', serif", fontSize: "4rem", color: "rgba(250,247,239,0.06)", lineHeight: 1 }}
      >
        ٤٠٤
      </p>
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.5rem",
          fontWeight: 300,
          color: "var(--color-text)",
        }}
      >
        Collection introuvable
      </h1>
      <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
        &laquo;{collection}&raquo; n&apos;est pas disponible ou n&apos;a pas encore été ingérée.
      </p>
      <Link href="/corpus" style={{ fontSize: "0.85rem", color: "var(--color-gold)" }}>
        ← Corpus
      </Link>
    </div>
  )
}
