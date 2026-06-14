import { z } from "zod"

import { dataEnvelopeSchema } from "./common"

export const entryModeSchema = z.enum(["one_time", "multi_scan"])

export const eventSummarySchema = z
  .object({
    id: z.number(),
    code: z.string().optional(),
    title: z.string().optional(),
    starts_at: z.string().nullable().optional(),
    ends_at: z.string().nullable().optional(),
    status: z.string().optional(),
    entry_mode: z.string().optional(),
  })
  .passthrough()

export type EventSummary = z.infer<typeof eventSummarySchema>

export const assignmentSchema = z
  .object({
    id: z.number(),
    scanner_account_id: z.number(),
    event_id: z.number(),
    assigned_by: z.number().nullable().optional(),
    assigned_at: z.string().nullable().optional(),
    revoked_at: z.string().nullable().optional(),
    event: eventSummarySchema.nullable().optional(),
  })
  .passthrough()

export type Assignment = z.infer<typeof assignmentSchema>

export const deviceSchema = z
  .object({
    id: z.number(),
    scanner_account_id: z.number(),
    device_label: z.string().nullable().optional(),
    device_token_hash: z.string().nullable().optional(),
    user_agent: z.string().nullable().optional(),
    last_seen_at: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
    revoked_at: z.string().nullable().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .passthrough()

export type ScannerDevice = z.infer<typeof deviceSchema>

export const scannerAccountSchema = z
  .object({
    id: z.number(),
    code: z.string().optional(),
    organizer_profile_id: z.number().optional(),
    user_id: z.number(),
    name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    is_active: z.boolean(),
    assignments: z.array(assignmentSchema).optional(),
    devices: z.array(deviceSchema).optional(),
  })
  .passthrough()

export type ScannerAccount = z.infer<typeof scannerAccountSchema>

export const deviceRegisterRequestSchema = z.object({
  device_label: z.string().max(160).optional(),
  device_token: z.string().max(255).optional(),
  user_agent: z.string().max(500).optional(),
})

export type DeviceRegisterRequest = z.infer<typeof deviceRegisterRequestSchema>

export const scanResultSchema = z.enum([
  "ok",
  "duplicate",
  "invalid",
  "expired",
  "wrong_event",
])

export type ScanResult = z.infer<typeof scanResultSchema>

export const failureReasonSchema = z.enum([
  "scanner_not_assigned",
  "ticket_not_found",
  "ticket_from_other_event",
  "before_window",
  "after_window",
  "already_scanned",
  "ticket_status_invalid",
])

export const createScanRequestSchema = z.object({
  event_id: z.number().int().positive(),
  ticket_code: z.string().min(1).max(80),
  device_id: z.number().int().positive(),
  occurrence_id: z.number().int().positive().optional(),
  scanned_at: z.string().optional(),
  signature: z.string().optional(),
  offline_client_id: z.string().max(80).optional(),
})

export type CreateScanRequest = z.infer<typeof createScanRequestSchema>

export const scanLogSchema = z
  .object({
    id: z.number(),
    scanner_account_id: z.number(),
    scanner_device_id: z.number(),
    event_id: z.number(),
    occurrence_id: z.number().nullable().optional(),
    ticket_id: z.number().nullable().optional(),
    ticket_ref: z.string(),
    holder_name_snapshot: z.string().nullable().optional(),
    seat_label_snapshot: z.string().nullable().optional(),
    ticket_type_snapshot: z.string().nullable().optional(),
    raw_payload_hash: z.string().optional(),
    result: scanResultSchema,
    failure_reason: failureReasonSchema.nullable().optional(),
    scan_mode: entryModeSchema.optional(),
    scanned_at: z.string(),
    offline_client_id: z.string().nullable().optional(),
    offline_synced_at: z.string().nullable().optional(),
    created_at: z.string().optional(),
  })
  .passthrough()

export type ScanLog = z.infer<typeof scanLogSchema>

export const assignmentsResponseSchema = dataEnvelopeSchema(z.array(assignmentSchema))
export const meResponseSchema = dataEnvelopeSchema(scannerAccountSchema)
export const deviceResponseSchema = dataEnvelopeSchema(deviceSchema)
export const scanResponseSchema = dataEnvelopeSchema(scanLogSchema)
