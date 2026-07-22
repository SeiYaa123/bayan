import { render, screen, fireEvent } from "@testing-library/react"
import AudioPlayer from "./AudioPlayer"
import { AudioProvider, useAudio } from "@/context/AudioContext"
import React from "react"

function TestTrigger() {
  const { playTrack } = useAudio()
  return (
    <button
      onClick={() =>
        playTrack({
          surah: 1,
          ayah: 1,
          title: "Sourate 1:1 · Al-Fatiha",
        })
      }
    >
      Play Test Track
    </button>
  )
}

describe("AudioPlayer", () => {
  test("renders nothing initially when no track is selected", () => {
    const { container } = render(
      <AudioProvider>
        <AudioPlayer />
      </AudioProvider>
    )
    expect(container.firstChild).toBeNull()
  })

  test("renders player bar when a track is played", () => {
    render(
      <AudioProvider>
        <TestTrigger />
        <AudioPlayer />
      </AudioProvider>
    )

    fireEvent.click(screen.getByText("Play Test Track"))

    expect(screen.getByLabelText("Lecteur audio de récitation du Coran")).toBeInTheDocument()
    expect(screen.getByText("Sourate 1:1 · Al-Fatiha")).toBeInTheDocument()
    expect(screen.getByLabelText("Sélection du récitateur")).toBeInTheDocument()
  })

  test("can toggle loop and speed controls", () => {
    render(
      <AudioProvider>
        <TestTrigger />
        <AudioPlayer />
      </AudioProvider>
    )

    fireEvent.click(screen.getByText("Play Test Track"))

    const loopBtn = screen.getByLabelText("Basculer la répétition")
    fireEvent.click(loopBtn)

    const speedBtn = screen.getByLabelText("Changer la vitesse de lecture")
    expect(speedBtn).toHaveTextContent("1x")
    fireEvent.click(speedBtn)
    expect(speedBtn).toHaveTextContent("1.25x")
  })
})
