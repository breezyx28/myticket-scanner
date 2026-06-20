import type { Reporter, TestCase, TestModule } from "vitest/node"

import { getTestEnvMeta } from "../helpers/env"
import { finalizeReport, initReport, recordFailure, recordPass, recordSkip } from "./reportWriter"

function visitTests(module: TestModule, visit: (test: TestCase) => void): void {
  const children = module.children as { allTests?: () => TestCase[] }
  if (typeof children.allTests === "function") {
    for (const test of children.allTests()) {
      visit(test)
    }
  }
}

export default class MarkdownReporter implements Reporter {
  onInit(): void {
    const meta = getTestEnvMeta()
    initReport({
      suite: "integration",
      apiBaseUrl: meta.apiBaseUrl,
      credentialsConfigured: meta.credentialsConfigured,
      realTicketEnabled: meta.realTicketEnabled,
    })
  }

  onTestRunEnd(testModules: ReadonlyArray<TestModule>): void {
    for (const mod of testModules) {
      visitTests(mod, (test) => {
        const state = test.result?.state
        if (state === "pass") {
          recordPass()
          return
        }
        if (state === "skip") {
          recordSkip()
          return
        }
        if (state === "fail") {
          const err = test.result?.errors?.[0]
          recordFailure({
            testName: test.fullName,
            file: mod.moduleId,
            message: err?.message ?? "Unknown error",
            stack: err?.stack,
          })
        }
      })
    }

    finalizeReport(testModules.every((m) => m.ok()))
  }
}
