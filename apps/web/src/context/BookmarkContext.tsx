"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

export interface BookmarkItem {
  id: string
  source_type: "quran" | "hadith" | "tafsir"
  reference: string
  collection?: string
  arabic: string
  translation?: string
  createdAt?: number
}

interface BookmarkContextType {
  bookmarks: BookmarkItem[]
  addBookmark: (item: BookmarkItem) => void
  removeBookmark: (id: string) => void
  toggleBookmark: (item: BookmarkItem) => void
  isBookmarked: (id: string) => boolean
  clearBookmarks: () => void
}

const STORAGE_KEY = "bayan_bookmarks_v1"

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined)

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setBookmarks(JSON.parse(stored))
      }
    } catch (e) {
      console.error("Failed to load bookmarks from localStorage", e)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  useEffect(() => {
    if (!isInitialized) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks))
    } catch (e) {
      console.error("Failed to save bookmarks to localStorage", e)
    }
  }, [bookmarks, isInitialized])

  const isBookmarked = useCallback(
    (id: string) => {
      return bookmarks.some((b) => b.id === id)
    },
    [bookmarks]
  )

  const addBookmark = useCallback((item: BookmarkItem) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.id === item.id)) return prev
      return [{ ...item, createdAt: item.createdAt ?? Date.now() }, ...prev]
    })
  }, [])

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const toggleBookmark = useCallback((item: BookmarkItem) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === item.id)
      if (exists) {
        return prev.filter((b) => b.id !== item.id)
      } else {
        return [{ ...item, createdAt: item.createdAt ?? Date.now() }, ...prev]
      }
    })
  }, [])

  const clearBookmarks = useCallback(() => {
    setBookmarks([])
  }, [])

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        addBookmark,
        removeBookmark,
        toggleBookmark,
        isBookmarked,
        clearBookmarks,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  )
}

export function useBookmark() {
  const context = useContext(BookmarkContext)
  if (!context) {
    throw new Error("useBookmark must be used within a BookmarkProvider")
  }
  return context
}
