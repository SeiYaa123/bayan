import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import RootAnalyzerModal from "./RootAnalyzerModal"

describe("RootAnalyzerModal Component", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    wordOrRoot: "رحم",
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock fetch to avoid network calls during tests
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            token: "رحم",
            root: "رحم",
            analysis: {
              root: "رحم",
              meaning_fr: "miséricorde, clémence",
              meaning_en: "mercy, compassion",
              forms: ["رَحِمَ", "رَحْمَة"],
              quran_count: 339,
              source: "static",
            },
          }),
      })
    ) as jest.Mock
  })

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <RootAnalyzerModal isOpen={false} onClose={jest.fn()} wordOrRoot="رحم" />
    )
    expect(container.firstChild).toBeNull()
  })

  it("renders calligraphic root and classical dictionary section correctly", async () => {
    await React.act(async () => {
      render(<RootAnalyzerModal {...defaultProps} />)
    })

    expect(screen.getByText("ر - ح - م")).toBeInTheDocument()
    expect(screen.getByText(/Miséricorde, clémence/i)).toBeInTheDocument()
    expect(screen.getByText(/Lisān al-ʿArab/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/roots/analyze?token=")
      )
    })
  })

  it("renders verb forms breakdown (Form I to Form X)", () => {
    render(<RootAnalyzerModal {...defaultProps} />)

    expect(screen.getByText(/Déclinaison des Formes Verbales/i)).toBeInTheDocument()
    expect(screen.getByText(/Forme I \(فَعَلَ\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Forme VI \(تَفَاعَلَ\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Forme X \(اسْتَفْعَلَ\)/i)).toBeInTheDocument()
  })

  it("renders corpus occurrences statistics", () => {
    render(<RootAnalyzerModal {...defaultProps} />)

    expect(screen.getByText(/Occurrences dans le Corpus Bayān/i)).toBeInTheDocument()
    expect(screen.getByText("339")).toBeInTheDocument()
  })

  it("calls onClose when close button is clicked", () => {
    const onClose = jest.fn()
    render(<RootAnalyzerModal {...defaultProps} onClose={onClose} />)

    const closeButton = screen.getByLabelText("Fermer la modal")
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("calls onClose when Escape key is pressed", () => {
    const onClose = jest.fn()
    render(<RootAnalyzerModal {...defaultProps} onClose={onClose} />)

    fireEvent.keyDown(window, { key: "Escape" })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("copies root to clipboard when copy button is clicked", async () => {
    const writeTextMock = jest.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    render(<RootAnalyzerModal {...defaultProps} />)

    const copyBtn = screen.getByTitle("Copier la racine")
    fireEvent.click(copyBtn)

    expect(writeTextMock).toHaveBeenCalledWith("ر - ح - م")
  })
})
