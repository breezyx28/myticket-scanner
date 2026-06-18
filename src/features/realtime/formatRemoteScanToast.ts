import type { TFunction } from "i18next"

import { scanFailureMessage } from "@/features/scan/scanFailureMessages"
import type { ScanRealtimeRow } from "@/shared/schemas/realtime"
import type { ScanResult } from "@/shared/schemas/scanner"

function resultLabel(t: TFunction, result: ScanResult): string {
  return t(`scanner.resultLabels.${result}`)
}

export function formatRemoteScanToast(row: ScanRealtimeRow, t: TFunction): string {
  const fallback = resultLabel(t, row.result)
  const label =
    row.failure_reason != null
      ? scanFailureMessage(t, row.failure_reason, fallback)
      : fallback
  const source = row.scanner_name?.trim() || t("common.anotherDevice")
  return t("common.remoteScanToast", {
    source,
    ticketRef: row.ticket_ref,
    label,
  })
}
