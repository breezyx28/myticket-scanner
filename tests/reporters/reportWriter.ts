import { appendFileSync, mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"

export const REPORT_PATH = path.resolve(process.cwd(), "docs/api-test-errors.md")

export interface FailureRecord {
  suite: "integration" | "e2e"
  testName: string
  file?: string
  message: string
  stack?: string
  httpStatus?: number
  httpBody?: unknown
  screenshotPath?: string
}

let runStarted = false
let currentSuite: "integration" | "e2e" = "integration"
const failures: FailureRecord[] = []
let passed = 0
let failed = 0
let skipped = 0

export function setReportSuite(suite: "integration" | "e2e"): void {
  currentSuite = suite
}

export function initReport(options: {
  suite: "integration" | "e2e"
  apiBaseUrl?: string
  credentialsConfigured?: boolean
  realTicketEnabled?: boolean
}): void {
  currentSuite = options.suite
  failures.length = 0
  passed = 0
  failed = 0
  skipped = 0
  runStarted = true

  mkdirSync(path.dirname(REPORT_PATH), { recursive: true })

  const header = `# API Test Error Report

> Auto-generated. Do not edit manually — re-run \`npm run test:api\` to refresh.

| Field | Value |
|-------|-------|
| Suite | ${options.suite} |
| Started | ${new Date().toISOString()} |
| API base | ${options.apiBaseUrl ?? "n/a"} |
| Credentials configured | ${options.credentialsConfigured ? "yes" : "no"} |
| Real ticket test enabled | ${options.realTicketEnabled ? "yes" : "no"} |

---

`

  if (options.suite === "integration") {
    writeFileSync(REPORT_PATH, header, "utf8")
  } else {
    appendFileSync(REPORT_PATH, `\n## E2E run — ${new Date().toISOString()}\n\n`, "utf8")
  }
}

export function recordFailure(record: Omit<FailureRecord, "suite">): void {
  failures.push({ ...record, suite: currentSuite })
  failed += 1

  const body =
    typeof record.httpBody === "string"
      ? record.httpBody
      : record.httpBody
        ? JSON.stringify(record.httpBody, null, 2)
        : undefined

  const section = `### FAIL: ${record.testName}

- **Suite:** ${currentSuite}
- **File:** ${record.file ?? "n/a"}
- **HTTP status:** ${record.httpStatus ?? "n/a"}
${record.screenshotPath ? `- **Screenshot:** ${record.screenshotPath}\n` : ""}
**Message:**

\`\`\`
${record.message}
\`\`\`

${record.stack ? `**Stack:**\n\n\`\`\`\n${record.stack}\n\`\`\`\n\n` : ""}${body ? `**Response body:**\n\n\`\`\`json\n${body}\n\`\`\`\n\n` : ""}---

`

  appendFileSync(REPORT_PATH, section, "utf8")
}

export function recordPass(): void {
  passed += 1
}

export function recordSkip(): void {
  skipped += 1
}

export function finalizeReport(allPassed: boolean): void {
  if (!runStarted) return

  const summary = `## Summary (${currentSuite})

| Passed | Failed | Skipped |
|--------|--------|---------|
| ${passed} | ${failed} | ${skipped} |

${allPassed && failures.length === 0 ? "**All tests passed.**\n" : ""}`

  appendFileSync(REPORT_PATH, `\n${summary}\n`, "utf8")
}

export function getFailureCount(): number {
  return failures.length
}
