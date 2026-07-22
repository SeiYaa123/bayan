import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import ShareCardModal from "./ShareCardModal"

beforeAll(() => {
  ;(HTMLCanvasElement.prototype.getContext as any) = jest.fn(() => ({
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 100 })),
    transform: jest.fn(),
    rect: jest.fn(),
    roundRect: jest.fn(),
    clip: jest.fn(),
    createLinearGradient: jest.fn(() => ({
      addColorStop: jest.fn(),
    })),
  }))
  HTMLCanvasElement.prototype.toDataURL = jest.fn(() => "data:image/png;base64,123")
})

describe("ShareCardModal", () => {
  const sampleData = {
    reference: "2:255",
    collection: "quran",
    source_type: "quran" as const,
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
    translation: "Allah - il n'y a de divinité que Lui.",
  }

  test("does not render when isOpen is false", () => {
    const { container } = render(
      <ShareCardModal data={sampleData} isOpen={false} onClose={jest.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  test("renders modal and options when isOpen is true", () => {
    render(
      <ShareCardModal data={sampleData} isOpen={true} onClose={jest.fn()} />
    )
    expect(screen.getByText("Générateur de Carte")).toBeInTheDocument()
    expect(screen.getByText(/Carré \(1:1\)/)).toBeInTheDocument()
    expect(screen.getByText(/Story \(9:16\)/)).toBeInTheDocument()
  })

  test("allows switching formats and themes", () => {
    render(
      <ShareCardModal data={sampleData} isOpen={true} onClose={jest.fn()} />
    )

    const storyBtn = screen.getByText(/Story \(9:16\)/)
    fireEvent.click(storyBtn)

    const ivoryBtn = screen.getByText("Ivory Parchment")
    fireEvent.click(ivoryBtn)

    expect(screen.getByText("Télécharger l'image (PNG)")).toBeInTheDocument()
  })
})
