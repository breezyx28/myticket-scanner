import { beforeAll, describe, expect, it } from "vitest"

import { scanResponseSchema } from "@/shared/schemas/scanner"
import { apiRequest } from "../helpers/apiClient"
import { assertSchema } from "../helpers/assertSchema"
import { getOptionalTicketCode, hasScannerCredentials } from "../helpers/env"
import { bootstrapScanner } from "../helpers/authSession"

describe.skipIf(!hasScannerCredentials())("scans API", () => {
  let token: string
  let deviceId: number
  let eventId: number

  beforeAll(async () => {
    const session = await bootstrapScanner()
    token = session.token
    deviceId = session.deviceId
    eventId = session.eventId
  })

  it("POST /scans returns invalid for unknown ticket code", async () => {
    const res = await apiRequest("/scans", {
      method: "POST",
      token,
      body: {
        event_id: eventId,
        ticket_code: "TIC-INVALID-INTEGRATION-TEST",
        device_id: deviceId,
      },
    })

    expect([200, 201]).toContain(res.status)
    const scan = assertSchema(scanResponseSchema, res.body, "createScan").data
    expect(scan.result).toBe("invalid")
  })

  it("POST /scans returns 422 when required fields are missing", async () => {
    const res = await apiRequest("/scans", {
      method: "POST",
      token,
      body: { ticket_code: "TIC-ONLY" },
    })

    expect(res.status).toBe(422)
  })

  it.skipIf(!getOptionalTicketCode())("POST /scans with real ticket when TEST_TICKET_CODE is set", async () => {
    const ticketCode = getOptionalTicketCode()!
    const res = await apiRequest("/scans", {
      method: "POST",
      token,
      body: {
        event_id: eventId,
        ticket_code: ticketCode,
        device_id: deviceId,
      },
    })

    expect([200, 201]).toContain(res.status)
    const scan = assertSchema(scanResponseSchema, res.body, "createScan").data
    expect(["ok", "duplicate"]).toContain(scan.result)
  })
})
