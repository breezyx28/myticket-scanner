import type {
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from "@playwright/test/reporter"

import { getTestEnvMeta } from "../helpers/env"
import {
  finalizeReport,
  initReport,
  recordFailure,
  recordPass,
  recordSkip,
  setReportSuite,
} from "./reportWriter"

export default class PlaywrightMarkdownReporter implements Reporter {
  onBegin(): void {
    setReportSuite("e2e")
    const meta = getTestEnvMeta()
    initReport({
      suite: "e2e",
      apiBaseUrl: meta.apiBaseUrl,
      credentialsConfigured: meta.credentialsConfigured,
      realTicketEnabled: meta.realTicketEnabled,
    })
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status === "passed") {
      recordPass()
      return
    }
    if (result.status === "skipped") {
      recordSkip()
      return
    }

    const screenshot = result.attachments.find((a) => a.name === "screenshot")?.path
    const err = result.errors[0]

    recordFailure({
      testName: test.titlePath().join(" > "),
      file: test.location.file,
      message: err?.message ?? `Test ${result.status}`,
      stack: err?.stack,
      screenshotPath: screenshot,
    })
  }

  onEnd(result: FullResult): void {
    finalizeReport(result.status === "passed")
  }
}
