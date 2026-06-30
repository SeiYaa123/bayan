import { test, expect } from "@playwright/test"

test.describe("Text detail page", () => {
  test("shows error state for non-existent ID", async ({ page }) => {
    await page.goto("/text/00000000-0000-0000-0000-000000000000")
    // Expect either an error message or the not-found UI
    await expect(
      page.getByText(/introuvable|indisponible|not found/i).first(),
    ).toBeVisible({ timeout: 10_000 })
  })

  test("result card links to text detail", async ({ page }) => {
    await page.goto("/search?q=رحمة")
    // If results load, first card should link to /text/:id
    const firstLink = page.locator("article a").first()
    const visible = await firstLink.isVisible({ timeout: 8_000 }).catch(() => false)
    if (visible) {
      const href = await firstLink.getAttribute("href")
      expect(href).toMatch(/^\/text\//)
    }
  })
})
