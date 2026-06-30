import { getHistory, addToHistory, clearHistory } from "./searchHistory"

beforeEach(() => {
  localStorage.clear()
})

describe("getHistory", () => {
  test("returns empty array when nothing stored", () => {
    expect(getHistory()).toEqual([])
  })

  test("returns empty array when stored value is invalid JSON", () => {
    localStorage.setItem("bayan:search_history", "not-json")
    expect(getHistory()).toEqual([])
  })
})

describe("addToHistory", () => {
  test("adds query to empty history", () => {
    addToHistory("رحمة")
    expect(getHistory()).toEqual(["رحمة"])
  })

  test("prepends new queries", () => {
    addToHistory("رحمة")
    addToHistory("جهاد")
    expect(getHistory()).toEqual(["جهاد", "رحمة"])
  })

  test("deduplicates and moves existing query to front", () => {
    addToHistory("رحمة")
    addToHistory("جهاد")
    addToHistory("رحمة")
    expect(getHistory()).toEqual(["رحمة", "جهاد"])
  })

  test("trims history to 8 entries", () => {
    for (let i = 1; i <= 9; i++) addToHistory(`query${i}`)
    expect(getHistory()).toHaveLength(8)
    expect(getHistory()[0]).toBe("query9")
    expect(getHistory()).not.toContain("query1")
  })

  test("ignores blank queries", () => {
    addToHistory("   ")
    expect(getHistory()).toEqual([])
  })
})

describe("clearHistory", () => {
  test("empties the history", () => {
    addToHistory("رحمة")
    clearHistory()
    expect(getHistory()).toEqual([])
  })
})
