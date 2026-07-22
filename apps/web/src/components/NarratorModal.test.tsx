import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import NarratorModal, { NarratorData } from "./NarratorModal"

describe("NarratorModal Component", () => {
  const sampleNarrator: NarratorData = {
    id: "narrator-123",
    name_arabic: "سفيان الثوري",
    name_transliterated: "Sufyan al-Thawri",
    death_year: 161,
    reliability: "thiqah",
    position: 1,
    transmission_type: "عن",
    generation: "2ème génération (Tabi'un)",
    city: "Koufa (Irak)",
    teachers: ["Abu Ishaq al-Sabi'i"],
    students: ["Abdullah ibn al-Mubarak"],
    narrated_hadiths: [
      { id: "h1", reference: "Sahih Bukhari #1", collection: "bukhari", arabic: "إنما الأعمال بالنيات" },
    ],
  }

  it("renders narrator details correctly", () => {
    render(<NarratorModal narrator={sampleNarrator} onClose={jest.fn()} />)

    expect(screen.getByText("سفيان الثوري")).toBeInTheDocument()
    expect(screen.getByText("Sufyan al-Thawri")).toBeInTheDocument()
    expect(screen.getAllByText(/Thiqa/i).length).toBeGreaterThan(0)
    expect(screen.getByText("Koufa (Irak)")).toBeInTheDocument()
    expect(screen.getByText("Abu Ishaq al-Sabi'i")).toBeInTheDocument()
    expect(screen.getByText("Abdullah ibn al-Mubarak")).toBeInTheDocument()
    expect(screen.getByText("bukhari")).toBeInTheDocument()
  })

  it("calls onClose when close button is clicked", () => {
    const handleClose = jest.fn()
    render(<NarratorModal narrator={sampleNarrator} onClose={handleClose} />)

    const closeBtn = screen.getByLabelText("Fermer la modal")
    fireEvent.click(closeBtn)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it("calls onClose when Escape key is pressed", () => {
    const handleClose = jest.fn()
    render(<NarratorModal narrator={sampleNarrator} onClose={handleClose} />)

    fireEvent.keyDown(window, { key: "Escape" })

    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
