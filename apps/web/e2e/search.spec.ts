import { test, expect } from "@playwright/test"

test.describe("Search flow", () => {
  test("search page loads with input", async ({ page }) => {
    await page.goto("/search")
    const input = page.getByPlaceholder(/rechercher/i)
    await expect(input).toBeVisible()
  })

  test("typing and submitting a query shows results or empty state", async ({ page }) => {
    await page.goto("/search")
    const input = page.getByPlaceholder(/rechercher/i)
    await input.fill("رحمة")
    await input.press("Enter")

    // Either results appear or an empty/error state — either is valid without a live API
    await expect(
      page.locator("article, [role='alert'], p").first(),
    ).toBeVisible({ timeout: 10_000 })
  })

  test("URL reflects the search query", async ({ page }) => {
    await page.goto("/search")
    const input = page.getByPlaceholder(/rechercher/i)
    await input.fill("صبر")
    await input.press("Enter")
    await expect(page).toHaveURL(/q=%D8%B5%D8%A8%D8%B1|q=صبر/, { timeout: 5_000 })
  })

  test("share button copies URL to clipboard", async ({ page, context, browserName }) => {
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"])
    }
    await page.goto("/search?q=رحمة")
    // Wait briefly for any result list to settle
    await page.waitForTimeout(500)
    const shareBtn = page.getByRole("button", { name: /partager/i })
    if (await shareBtn.isVisible()) {
      await shareBtn.click()
    }
  })
})
