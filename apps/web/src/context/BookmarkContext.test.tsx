import React from "react"
import { render, screen, act } from "@testing-library/react"
import { BookmarkProvider, useBookmark } from "./BookmarkContext"

function TestComponent() {
  const { bookmarks, toggleBookmark, isBookmarked, removeBookmark, clearBookmarks } = useBookmark()

  return (
    <div>
      <span data-testid="count">{bookmarks.length}</span>
      <span data-testid="is-bookmarked">{isBookmarked("item-1") ? "yes" : "no"}</span>
      <button
        data-testid="toggle-btn"
        onClick={() =>
          toggleBookmark({
            id: "item-1",
            source_type: "quran",
            reference: "2:255",
            arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ",
            translation: "Allah - il n'y a de divinité que Lui",
          })
        }
      >
        Toggle
      </button>
      <button data-testid="remove-btn" onClick={() => removeBookmark("item-1")}>
        Remove
      </button>
      <button data-testid="clear-btn" onClick={clearBookmarks}>
        Clear
      </button>
    </div>
  )
}

describe("BookmarkContext", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test("initializes with empty bookmarks", () => {
    render(
      <BookmarkProvider>
        <TestComponent />
      </BookmarkProvider>
    )

    expect(screen.getByTestId("count")).toHaveTextContent("0")
    expect(screen.getByTestId("is-bookmarked")).toHaveTextContent("no")
  })

  test("toggles a bookmark item", () => {
    render(
      <BookmarkProvider>
        <TestComponent />
      </BookmarkProvider>
    )

    act(() => {
      screen.getByTestId("toggle-btn").click()
    })

    expect(screen.getByTestId("count")).toHaveTextContent("1")
    expect(screen.getByTestId("is-bookmarked")).toHaveTextContent("yes")

    // Toggle again to remove
    act(() => {
      screen.getByTestId("toggle-btn").click()
    })

    expect(screen.getByTestId("count")).toHaveTextContent("0")
    expect(screen.getByTestId("is-bookmarked")).toHaveTextContent("no")
  })

  test("removes and clears bookmarks", () => {
    render(
      <BookmarkProvider>
        <TestComponent />
      </BookmarkProvider>
    )

    act(() => {
      screen.getByTestId("toggle-btn").click()
    })

    expect(screen.getByTestId("count")).toHaveTextContent("1")

    act(() => {
      screen.getByTestId("remove-btn").click()
    })

    expect(screen.getByTestId("count")).toHaveTextContent("0")
  })
})
