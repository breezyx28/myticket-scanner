import { beforeAll, describe, expect, it } from "vitest"

import { z } from "zod"

import { dataEnvelopeSchema } from "@/shared/schemas/common"
import { scanLogSchema } from "@/shared/schemas/scanner"
import { apiRequest } from "../helpers/apiClient"
import { assertSchema } from "../helpers/assertSchema"
import { bootstrapScanner } from "../helpers/authSession"
import { hasScannerCredentials } from "../helpers/env"

const syncResponseSchema = dataEnvelopeSchema(
  z.array(z.union([scanLogSchema, z.object({ result: z.literal("duplicate_sync") })])),
)

describe.skipIf(!hasScannerCredentials())("scans sync API parity", () => {
  let token: string
  let deviceId: number
  let eventId: number

  beforeAll(async () => {
    const session = await bootstrapScanner()
    token = session.token
    deviceId = session.deviceId
    eventId = session.eventId
  })

  it("POST /scans/sync accepts offline scan batch", async () => {
    const res = await apiRequest("/scans/sync", {
      method: "POST",
      token,
      body: {
        scans: [
          {
            event_id: eventId,
            ticket_code: "TIC-INVALID-SYNC-TEST",
            device_id: deviceId,
            offline_client_id: `off-${Date.now()}`,
          },
        ],
      },
    })

    expect(res.status).toBe(200)
    const data = assertSchema(syncResponseSchema, res.body, "scansSync").data
    expect(data.length).toBeGreaterThan(0)
  })
})
