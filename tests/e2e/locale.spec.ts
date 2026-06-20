import { expect, test } from "@playwright/test"

test.describe("locale", () => {
  test("language switcher toggles document direction", async ({ page }) => {
    await page.goto("/login")

    const html = page.locator("html")
    const initialDir = await html.getAttribute("dir")

    const switcher = page.getByRole("group", { name: /language|اللغة/i })
    await switcher.getByRole("button", { pressed: false }).click()

    const nextDir = await html.getAttribute("dir")
    expect(nextDir).not.toBe(initialDir)
  })
})
