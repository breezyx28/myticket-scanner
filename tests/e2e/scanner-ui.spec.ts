import { expect, test } from "./fixtures"

test.describe("scanner UI", () => {
  test.beforeEach(async ({ page, credentials }) => {
    await page.goto("/login")
    await page.locator("#email").fill(credentials.email)
    await page.locator("#password").fill(credentials.password)
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/$/)
  })

  test("shows event picker and validates manual ticket entry against API", async ({ page }) => {
    await expect(page.locator('[role="combobox"]').first()).toBeVisible()

    await page.getByRole("button", { name: /manual|يدوي/i }).first().click()
    await page.locator("#manual").fill("TIC-INVALID-E2E-TEST")
    await page.getByRole("button", { name: /validate|تحقق/i }).click()

    await expect(page.getByText(/entry denied|رفض الدخول|invalid ticket|تذكرة غير/i)).toBeVisible({
      timeout: 15_000,
    })
  })
})
