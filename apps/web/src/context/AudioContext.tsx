"use client"

import React, { createContext, useContext, useState, useRef, useEffect } from "react"

export interface Reciter {
  id: string
  name: string
  arabicName: string
  subfolder: string
}

export const RECITERS: Reciter[] = [
  {
    id: "alafasy",
    name: "Mishary Rashid Alafasy",
    arabicName: "مشاري راشد العفاسي",
    subfolder: "Alafasy_128kbps",
  },
  {
    id: "husary",
    name: "Mahmoud Khalil Al-Husary",
    arabicName: "محمود خليل الحصري",
    subfolder: "Husary_128kbps",
  },
  {
    id: "abdulbasit",
    name: "Abdul Basit Murattal",
    arabicName: "عبد الباسط عبد الصمد",
    subfolder: "Abdul_Basit_Murattal_192kbps",
  },
  {
    id: "minshawi",
    name: "Mohamed Siddiq El-Minshawi",
    arabicName: "محمد صديق المنشاوي",
    subfolder: "Minshawy_Murattal_128kbps",
  },
]

export interface AudioTrack {
  surah: number
  ayah: number
  title?: string
  arabicText?: string
  surahName?: string
  totalAyahsInSurah?: number
}

export function getAyahAudioUrl(surah: number, ayah: number, reciterSubfolder: string): string {
  const surahStr = String(surah).padStart(3, "0")
  const ayahStr = String(ayah).padStart(3, "0")
  return `https://everyayah.com/data/${reciterSubfolder}/${surahStr}${ayahStr}.mp3`
}

export function parseQuranReference(
  ref?: string,
  metadata?: Record<string, unknown>
): { surah: number; ayah: number } | null {
  if (metadata && metadata.surah !== undefined && metadata.ayah !== undefined) {
    const s = parseInt(String(metadata.surah), 10)
    const a = parseInt(String(metadata.ayah), 10)
    if (!isNaN(s) && !isNaN(a) && s >= 1 && s <= 114 && a >= 1) {
      return { surah: s, ayah: a }
    }
  }

  if (!ref) return null
  const cleanRef = ref.replace(/^quran:/i, "").trim()
  const parts = cleanRef.split(":")
  if (parts.length === 2) {
    const s = parseInt(parts[0], 10)
    const a = parseInt(parts[1], 10)
    if (!isNaN(s) && !isNaN(a) && s >= 1 && s <= 114 && a >= 1) {
      return { surah: s, ayah: a }
    }
  }

  return null
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`
}

interface AudioContextType {
  currentTrack: AudioTrack | null
  isPlaying: boolean
  isLoading: boolean
  duration: number
  currentTime: number
  playbackRate: number
  isLooping: boolean
  reciter: Reciter
  playTrack: (track: AudioTrack) => void
  pauseTrack: () => void
  resumeTrack: () => void
  togglePlayTrack: (track: AudioTrack) => void
  seek: (time: number) => void
  setPlaybackRate: (rate: number) => void
  setIsLooping: (loop: boolean) => void
  setReciterId: (id: string) => void
  isTrackPlaying: (surah: number, ayah: number) => boolean
  isTrackSelected: (surah: number, ayah: number) => boolean
  playNextAyah: () => void
  playPreviousAyah: () => void
  closePlayer: () => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [playbackRate, setPlaybackRateState] = useState<number>(1)
  const [isLooping, setIsLoopingState] = useState<boolean>(false)
  const [reciter, setReciterState] = useState<Reciter>(RECITERS[0])

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentTrackRef = useRef<AudioTrack | null>(null)
  const isLoopingRef = useRef<boolean>(false)
  const reciterRef = useRef<Reciter>(RECITERS[0])

  currentTrackRef.current = currentTrack
  isLoopingRef.current = isLooping
  reciterRef.current = reciter

  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0)
    }

    const handleWaiting = () => {
      setIsLoading(true)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    const handleEnded = () => {
      if (isLoopingRef.current) {
        audio.currentTime = 0
        audio.play().catch(() => setIsPlaying(false))
      } else if (currentTrackRef.current) {
        const track = currentTrackRef.current
        if (track.totalAyahsInSurah && track.ayah < track.totalAyahsInSurah) {
          const nextTrack: AudioTrack = {
            ...track,
            ayah: track.ayah + 1,
            title: `Sourate ${track.surah}:${track.ayah + 1}`,
          }
          setCurrentTrack(nextTrack)
          const url = getAyahAudioUrl(nextTrack.surah, nextTrack.ayah, reciterRef.current.subfolder)
          setIsLoading(true)
          setCurrentTime(0)
          setDuration(0)
          audio.src = url
          audio.play().catch(() => setIsPlaying(false))
        } else {
          setIsPlaying(false)
        }
      } else {
        setIsPlaying(false)
      }
    }

    const handleError = () => {
      setIsLoading(false)
      setIsPlaying(false)
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("waiting", handleWaiting)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    return () => {
      audio.pause()
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("waiting", handleWaiting)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  const loadAndPlayTrack = (track: AudioTrack, reciterSubfolder: string) => {
    if (!audioRef.current) return
    const url = getAyahAudioUrl(track.surah, track.ayah, reciterSubfolder)
    setIsLoading(true)
    setCurrentTime(0)
    setDuration(0)
    audioRef.current.src = url
    audioRef.current.playbackRate = playbackRate
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.error("Audio playback error:", err)
        setIsPlaying(false)
        setIsLoading(false)
      })
  }

  const playTrack = (track: AudioTrack) => {
    setCurrentTrack(track)
    loadAndPlayTrack(track, reciter.subfolder)
  }

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const resumeTrack = () => {
    if (audioRef.current && currentTrack) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }
  }

  const togglePlayTrack = (track: AudioTrack) => {
    if (currentTrack && currentTrack.surah === track.surah && currentTrack.ayah === track.ayah) {
      if (isPlaying) {
        pauseTrack()
      } else {
        resumeTrack()
      }
    } else {
      playTrack(track)
    }
  }

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const setPlaybackRate = (rate: number) => {
    setPlaybackRateState(rate)
  }

  const setIsLooping = (loop: boolean) => {
    setIsLoopingState(loop)
  }

  const setReciterId = (id: string) => {
    const found = RECITERS.find((r) => r.id === id) || RECITERS[0]
    setReciterState(found)
    if (currentTrack) {
      loadAndPlayTrack(currentTrack, found.subfolder)
    }
  }

  const isTrackPlaying = (surah: number, ayah: number) => {
    return isPlaying && currentTrack?.surah === surah && currentTrack?.ayah === ayah
  }

  const isTrackSelected = (surah: number, ayah: number) => {
    return currentTrack?.surah === surah && currentTrack?.ayah === ayah
  }

  const playNextAyah = () => {
    if (!currentTrack) return
    const nextAyah = currentTrack.ayah + 1
    const nextTrack: AudioTrack = {
      ...currentTrack,
      ayah: nextAyah,
      title: `Sourate ${currentTrack.surah}:${nextAyah}`,
    }
    playTrack(nextTrack)
  }

  const playPreviousAyah = () => {
    if (!currentTrack || currentTrack.ayah <= 1) return
    const prevAyah = currentTrack.ayah - 1
    const prevTrack: AudioTrack = {
      ...currentTrack,
      ayah: prevAyah,
      title: `Sourate ${currentTrack.surah}:${prevAyah}`,
    }
    playTrack(prevTrack)
  }

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
    setCurrentTrack(null)
  }

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        duration,
        currentTime,
        playbackRate,
        isLooping,
        reciter,
        playTrack,
        pauseTrack,
        resumeTrack,
        togglePlayTrack,
        seek,
        setPlaybackRate,
        setIsLooping,
        setReciterId,
        isTrackPlaying,
        isTrackSelected,
        playNextAyah,
        playPreviousAyah,
        closePlayer,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}
