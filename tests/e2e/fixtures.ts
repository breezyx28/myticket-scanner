import { test as base, expect } from "@playwright/test"

import { hasScannerCredentials } from "../helpers/env"

export const test = base.extend({
  credentials: async ({}, use, testInfo) => {
    if (!hasScannerCredentials()) {
      testInfo.skip(true, "Set TEST_SCANNER_EMAIL and TEST_SCANNER_PASSWORD in .env.test")
      return
    }

    const email = process.env.TEST_SCANNER_EMAIL!.trim()
    const password = process.env.TEST_SCANNER_PASSWORD!
    await use({ email, password })
  },
})

export { expect }
