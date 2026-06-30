const KEY = "bayan:search_history"
const MAX = 8

export function getHistory(): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]")
  } catch {
    return []
  }
}

export function addToHistory(query: string): void {
  if (typeof window === "undefined" || !query.trim()) return
  const prev = getHistory().filter((q) => q !== query)
  const next = [query, ...prev].slice(0, MAX)
  localStorage.setItem(KEY, JSON.stringify(next))
}

export function clearHistory(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(KEY)
}
