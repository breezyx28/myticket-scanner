import { expect, test } from "@playwright/test"

test.describe("route guards", () => {
  test("redirects unauthenticated users from scanner to login", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/login/)
  })
})
