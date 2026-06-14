import { scanFailureMessage } from "@/features/scan/scanFailureMessages"
import type { ScanRealtimeRow } from "@/shared/schemas/realtime"
import type { ScanResult } from "@/shared/schemas/scanner"

const RESULT_LABELS: Record<ScanResult, string> = {
  ok: "Entry granted",
  duplicate: "Already used",
  invalid: "Invalid ticket",
  expired: "Expired",
  wrong_event: "Wrong event",
}

export function formatRemoteScanToast(row: ScanRealtimeRow): string {
  const label =
    row.failure_reason != null
      ? scanFailureMessage(row.failure_reason, RESULT_LABELS[row.result] ?? row.result)
      : (RESULT_LABELS[row.result] ?? row.result)
  const source = row.scanner_name?.trim() || "Another device"
  return `${source}: ${row.ticket_ref} — ${label}`
}
