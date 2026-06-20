import { expect, test } from "./fixtures"

test.describe("logout", () => {
  test("clears session and returns to login", async ({ page, credentials }) => {
    await page.goto("/login")
    await page.locator("#email").fill(credentials.email)
    await page.locator("#password").fill(credentials.password)
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/$/)

    await page.getByRole("button", { name: /log out|تسجيل الخروج/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })
})
