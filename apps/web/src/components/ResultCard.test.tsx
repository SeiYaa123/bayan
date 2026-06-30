import { render, screen } from "@testing-library/react"
import ResultCard from "./ResultCard"
import type { SearchResult } from "@/lib/api"

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      prefetch: () => null,
      push: () => null,
      replace: () => null,
    }
  },
}))

const BASE: SearchResult = {
  id: "abc-123",
  reference: "2:255",
  arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
  translation_fr: "Allah — il n'y a de divinité que Lui.",
  translation_en: null,
  source_type: "quran",
  collection: "quran",
  score: 0.014,
  match_type: "semantic",
  metadata: {},
}

function make(overrides: Partial<SearchResult> = {}): SearchResult {
  return { ...BASE, ...overrides }
}

describe("ResultCard", () => {
  test("renders the reference", () => {
    render(<ResultCard result={make()} />)
    expect(screen.getByText("2:255")).toBeInTheDocument()
  })

  test("renders Arabic text", () => {
    render(<ResultCard result={make()} />)
    expect(screen.getByText(BASE.arabic)).toBeInTheDocument()
  })

  test("renders French translation when available", () => {
    render(<ResultCard result={make()} />)
    expect(screen.getByText("Allah — il n'y a de divinité que Lui.")).toBeInTheDocument()
  })

  test("falls back to English when French is absent", () => {
    render(<ResultCard result={make({ translation_fr: null, translation_en: "No god but Him." })} />)
    expect(screen.getByText("No god but Him.")).toBeInTheDocument()
  })

  test("hides translation section when both translations are null", () => {
    render(<ResultCard result={make({ translation_fr: null, translation_en: null })} />)
    expect(screen.queryByText(/Allah/)).not.toBeInTheDocument()
  })

  test("shows semantic match badge", () => {
    render(<ResultCard result={make({ match_type: "semantic" })} />)
    expect(screen.getByText("Sémantique")).toBeInTheDocument()
  })

  test("shows keyword match badge", () => {
    render(<ResultCard result={make({ match_type: "keyword" })} />)
    expect(screen.getByText("Mot-clé")).toBeInTheDocument()
  })

  test("shows hybrid match badge", () => {
    render(<ResultCard result={make({ match_type: "hybrid" })} />)
    expect(screen.getByText("Hybride")).toBeInTheDocument()
  })

  test("renders collection label for bukhari", () => {
    render(<ResultCard result={make({ source_type: "hadith", collection: "bukhari" })} />)
    expect(screen.getByText(/Sahih Bukhari/)).toBeInTheDocument()
  })

  test("renders unknown collection as-is", () => {
    render(<ResultCard result={make({ collection: "custom_corpus" })} />)
    expect(screen.getByText(/custom_corpus/)).toBeInTheDocument()
  })

  test("connexions link points to /text/:id", () => {
    render(<ResultCard result={make()} />)
    const link = screen.getByRole("link", { name: /connexions/i })
    expect(link).toHaveAttribute("href", "/text/abc-123")
  })
})
