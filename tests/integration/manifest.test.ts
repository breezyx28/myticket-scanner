import { beforeAll, describe, expect, it } from "vitest"

import { z } from "zod"

import { dataEnvelopeSchema } from "@/shared/schemas/common"
import { apiRequest } from "../helpers/apiClient"
import { assertSchema } from "../helpers/assertSchema"
import { bootstrapScanner } from "../helpers/authSession"
import { hasScannerCredentials } from "../helpers/env"

const manifestSchema = dataEnvelopeSchema(
  z
    .object({
      event_id: z.number(),
      tickets: z.array(
        z.object({
          code: z.string(),
          ticket_id: z.number(),
          holder_hash: z.string().optional(),
        }),
      ),
      manifest_hash: z.string(),
    })
    .passthrough(),
)

describe.skipIf(!hasScannerCredentials())("event manifest API parity", () => {
  let token: string
  let eventId: number

  beforeAll(async () => {
    const session = await bootstrapScanner()
    token = session.token
    eventId = session.eventId
  })

  it("GET /events/{id}/manifest returns manifest envelope", async () => {
    const res = await apiRequest(`/events/${eventId}/manifest`, { token })
    expect(res.status).toBe(200)
    const manifest = assertSchema(manifestSchema, res.body, "manifest").data
    expect(manifest.event_id).toBe(eventId)
    expect(Array.isArray(manifest.tickets)).toBe(true)
  })
})
