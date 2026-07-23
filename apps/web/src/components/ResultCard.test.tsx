import { render, screen } from "@testing-library/react"
import ResultCard from "./ResultCard"
import type { SearchResult } from "@/lib/api"
import { AudioProvider } from "@/context/AudioContext"

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

import { BookmarkProvider } from "@/context/BookmarkContext"

function renderWithAudio(ui: React.ReactElement) {
  return render(
    <BookmarkProvider>
      <AudioProvider>{ui}</AudioProvider>
    </BookmarkProvider>
  )
}

describe("ResultCard", () => {
  test("renders the reference", () => {
    renderWithAudio(<ResultCard result={make()} />)
    expect(screen.getByText("2:255")).toBeInTheDocument()
  })

  test("renders Arabic text and root analyzer button", () => {
    renderWithAudio(<ResultCard result={make()} />)
    expect(screen.getByText(/اللَّهُ/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Analyser la racine/i })).toBeInTheDocument()
  })

  test("renders French translation when available", () => {
    renderWithAudio(<ResultCard result={make()} />)
    expect(screen.getByText("Allah — il n'y a de divinité que Lui.")).toBeInTheDocument()
  })

  test("falls back to English when French is absent", () => {
    renderWithAudio(<ResultCard result={make({ translation_fr: null, translation_en: "No god but Him." })} />)
    expect(screen.getByText("No god but Him.")).toBeInTheDocument()
  })

  test("hides translation section when both translations are null", () => {
    renderWithAudio(<ResultCard result={make({ translation_fr: null, translation_en: null })} />)
    expect(screen.queryByText(/Allah/)).not.toBeInTheDocument()
  })

  test("shows semantic match badge", () => {
    renderWithAudio(<ResultCard result={make({ match_type: "semantic" })} />)
    expect(screen.getByText("Sémantique")).toBeInTheDocument()
  })

  test("shows keyword match badge", () => {
    renderWithAudio(<ResultCard result={make({ match_type: "keyword" })} />)
    expect(screen.getByText("Mot-clé")).toBeInTheDocument()
  })

  test("shows hybrid match badge", () => {
    renderWithAudio(<ResultCard result={make({ match_type: "hybrid" })} />)
    expect(screen.getByText("Hybride")).toBeInTheDocument()
  })

  test("renders collection label for bukhari", () => {
    renderWithAudio(<ResultCard result={make({ source_type: "hadith", collection: "bukhari" })} />)
    expect(screen.getByText(/Sahih Bukhari/)).toBeInTheDocument()
  })

  test("renders unknown collection as-is", () => {
    renderWithAudio(<ResultCard result={make({ collection: "custom_corpus" })} />)
    expect(screen.getByText(/custom_corpus/)).toBeInTheDocument()
  })


  test("renders play recitation button for quran results", () => {
    renderWithAudio(<ResultCard result={make()} />)
    expect(screen.getByRole("button", { name: /Écouter la récitation/i })).toBeInTheDocument()
  })

  test("renders bookmark toggle button", () => {
    renderWithAudio(<ResultCard result={make()} />)
    expect(screen.getByRole("button", { name: /Ajouter aux favoris/i })).toBeInTheDocument()
  })

  test("renders share card button", () => {
    renderWithAudio(<ResultCard result={make()} />)
    expect(screen.getByRole("button", { name: /Générer une carte/i })).toBeInTheDocument()
  })
})

