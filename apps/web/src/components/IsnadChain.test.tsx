import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import IsnadChain, { Narrator } from "./IsnadChain"

describe("IsnadChain Component", () => {
  const sampleChain: Narrator[] = [
    {
      id: "n1",
      name_arabic: "مالك بن أنس",
      name_transliterated: "Malik ibn Anas",
      death_year: 179,
      reliability: "thiqah",
      position: 1,
      transmission_type: "حدثنا",
    },
    {
      id: "n2",
      name_arabic: "نافع مولى ابن عمر",
      name_transliterated: "Nafi' mawla Ibn 'Umar",
      death_year: 117,
      reliability: "thiqah",
      position: 2,
      transmission_type: "عن",
    },
  ]

  it("renders chain of narrators and grade", () => {
    render(<IsnadChain chain={sampleChain} overall_grade="sahih" weakest_link={null} />)

    expect(screen.getByText("Sahih")).toBeInTheDocument()
    expect(screen.getByText("مالك بن أنس")).toBeInTheDocument()
    expect(screen.getByText("نافع مولى ابن عمر")).toBeInTheDocument()
  })

  it("opens NarratorModal when a narrator card is clicked", () => {
    const handleSelect = jest.fn()
    render(<IsnadChain chain={sampleChain} overall_grade="sahih" weakest_link={null} onNarratorSelect={handleSelect} />)

    const narratorCard = screen.getByText("مالك بن أنس")
    fireEvent.click(narratorCard)

    expect(handleSelect).toHaveBeenCalledWith(sampleChain[0])
    expect(screen.getByText("Fiche Transmetteur (Rāwī)")).toBeInTheDocument()
  })
})
