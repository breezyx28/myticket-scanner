import { expect, test } from "./fixtures"

test.describe("login flow", () => {
  test("signs in with scanner credentials and opens scanner home", async ({ page, credentials }) => {
    await page.goto("/login")

    await page.locator("#email").fill(credentials.email)
    await page.locator("#password").fill(credentials.password)
    await page.locator('button[type="submit"]').click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText(credentials.email, { exact: false })).toBeVisible()
  })
})
