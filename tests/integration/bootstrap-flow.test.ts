import { describe, expect, it } from "vitest"

import { bootstrapScanner } from "../helpers/authSession"
import { hasScannerCredentials } from "../helpers/env"

describe.skipIf(!hasScannerCredentials())("bootstrap flow (mirrors app session)", () => {
  it("login → me → assignments → device register", async () => {
    const session = await bootstrapScanner()

    expect(session.token.length).toBeGreaterThan(0)
    expect(session.me.is_active).toBe(true)
    expect(session.assignments.length).toBeGreaterThanOrEqual(0)
    expect(session.deviceId).toBeGreaterThan(0)
    expect(session.eventId).toBeGreaterThan(0)
  })
})
