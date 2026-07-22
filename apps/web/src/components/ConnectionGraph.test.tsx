import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"

jest.mock("d3", () => ({
  select: jest.fn(() => ({
    selectAll: jest.fn().mockReturnThis(),
    remove: jest.fn().mockReturnThis(),
    attr: jest.fn().mockReturnThis(),
    append: jest.fn().mockReturnThis(),
    style: jest.fn().mockReturnThis(),
    call: jest.fn().mockReturnThis(),
    data: jest.fn().mockReturnThis(),
    join: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    html: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
  })),
  forceSimulation: jest.fn(() => ({
    force: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    alphaTarget: jest.fn().mockReturnThis(),
    restart: jest.fn().mockReturnThis(),
    stop: jest.fn(),
  })),
  forceLink: jest.fn(() => ({ id: jest.fn().mockReturnThis(), distance: jest.fn().mockReturnThis() })),
  forceManyBody: jest.fn(() => ({ strength: jest.fn().mockReturnThis() })),
  forceCenter: jest.fn(),
  forceCollide: jest.fn(),
  zoom: jest.fn(() => ({ scaleExtent: jest.fn().mockReturnThis(), on: jest.fn().mockReturnThis() })),
  drag: jest.fn(() => ({ on: jest.fn().mockReturnThis() })),
}))

import ConnectionGraph from "./ConnectionGraph"

describe("ConnectionGraph Component", () => {
  const centerNode = {
    id: "center-1",
    reference: "Sahih Bukhari #1",
    type: "hadith",
  }

  const connections = [
    {
      id: "c-1",
      reference: "Surah Al-Baqarah 2:255",
      source_type: "quran",
      arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
      ref_type: "citation",
      confidence: 0.92,
    },
    {
      id: "c-2",
      reference: "Sahih Muslim #1907",
      source_type: "hadith",
      arabic: "إنما الأعمال بالنيات",
      ref_type: "parallèle",
      confidence: 0.78,
    },
    {
      id: "c-3",
      reference: "Tafsir Ibn Kathir 2:255",
      source_type: "tafsir",
      arabic: "هذه آية الكرسي",
      ref_type: "explication",
      confidence: 0.72,
    },
  ]

  it("renders graph controls and filter options", () => {
    render(<ConnectionGraph centerNode={centerNode} connections={connections} />)

    expect(screen.getByText(/Seuil Cosinus/i)).toBeInTheDocument()
    expect(screen.getByText("Coran")).toBeInTheDocument()
    expect(screen.getByText("Hadith")).toBeInTheDocument()
    expect(screen.getByText("Tafsir")).toBeInTheDocument()
  })

  it("updates threshold filter value when slider is moved", () => {
    render(<ConnectionGraph centerNode={centerNode} connections={connections} />)

    const slider = screen.getByLabelText("Filtre seuil de similarité cosinus")
    fireEvent.change(slider, { target: { value: "0.80" } })

    expect(screen.getByText(/0.80 \(80%\)/)).toBeInTheDocument()
  })
})
