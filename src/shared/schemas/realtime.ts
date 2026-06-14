import { z } from "zod"

import { failureReasonSchema, scanResultSchema } from "./scanner"

export const scanRealtimeRowSchema = z
  .object({
    id: z.number(),
    event_id: z.number(),
    scanner_account_id: z.number(),
    scanner_name: z.string().nullable().optional(),
    device_id: z.number(),
    ticket_ref: z.string(),
    result: scanResultSchema,
    failure_reason: failureReasonSchema.nullable().optional(),
    scanned_at: z.string(),
  })
  .passthrough()

export type ScanRealtimeRow = z.infer<typeof scanRealtimeRowSchema>

export const scanRecordedEnvelopeSchema = z
  .object({
    type: z.literal("scan.recorded").optional(),
    payload: z.union([scanRealtimeRowSchema, z.object({ item: scanRealtimeRowSchema }).passthrough()]),
    occurred_at: z.string().optional(),
  })
  .passthrough()

export type ScanRecordedEnvelope = z.infer<typeof scanRecordedEnvelopeSchema>

export function parseScanRecordedEnvelope(raw: unknown): ScanRealtimeRow | null {
  if (!raw || typeof raw !== "object") return null

  const envelope = scanRecordedEnvelopeSchema.safeParse(raw)
  if (envelope.success) {
    const payload = envelope.data.payload
    if ("item" in payload && payload.item) {
      const item = scanRealtimeRowSchema.safeParse(payload.item)
      if (item.success) return item.data
    }
    const row = scanRealtimeRowSchema.safeParse(payload)
    if (row.success) return row.data
  }

  const direct = scanRealtimeRowSchema.safeParse(raw)
  if (direct.success) return direct.data

  return null
}
