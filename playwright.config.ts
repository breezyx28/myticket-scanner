import { config as loadEnv } from "dotenv"
import path from "node:path"
import { defineConfig, devices } from "@playwright/test"

loadEnv({ path: path.resolve(process.cwd(), ".env.test"), quiet: true })
loadEnv({ path: path.resolve(process.cwd(), ".env"), quiet: true })

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["./tests/reporters/playwrightMarkdownReporter.ts"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    locale: process.env.TEST_ACCEPT_LANGUAGE === "ar" ? "ar-SA" : "en-US",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
