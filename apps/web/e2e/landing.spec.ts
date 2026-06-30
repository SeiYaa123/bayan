import { test, expect } from "@playwright/test"

test.describe("Landing page", () => {
  test("loads and shows product name", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/Bayān/i)
    await expect(page.getByRole("link", { name: /Bayān/i }).first()).toBeVisible()
  })

  test("CTA button navigates to /search", async ({ page }) => {
    await page.goto("/")
    const cta = page.getByRole("link", { name: /commencer|rechercher|explorer/i }).first()
    await expect(cta).toBeVisible()
    await cta.click()
    await expect(page).toHaveURL(/\/search/)
  })

  test("navigation links are accessible", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("navigation").first()).toBeVisible()
  })
})
