import type { TFunction } from "i18next"

import { scanFailureMessage } from "@/features/scan/scanFailureMessages"
import type { Assignment } from "@/shared/schemas/scanner"
import type { ScanLog } from "@/shared/schemas/scanner"

import type { ScanResultDetail } from "./types"

function eventTitle(t: TFunction, assignment: Assignment | null | undefined): string {
  return assignment?.event?.title ?? t("common.event")
}

export function mapScanLogToResult(
  log: ScanLog,
  assignment: Assignment | null | undefined,
  t: TFunction,
): ScanResultDetail {
  const eventName = eventTitle(t, assignment)
  const unavailable = t("common.notAvailable")

  switch (log.result) {
    case "ok":
      return {
        kind: "success",
        holderName: log.holder_name_snapshot ?? t("common.guest"),
        eventName,
        venue: assignment?.event?.code || unavailable,
        section: log.seat_label_snapshot?.split("-")[0]?.trim() || unavailable,
        seat: log.seat_label_snapshot ?? unavailable,
        ticketType: log.ticket_type_snapshot ?? t("common.ticket"),
      }
    case "duplicate":
      return {
        kind: "used",
        holderName: log.holder_name_snapshot ?? t("common.guest"),
        eventName,
      }
    case "expired":
      return {
        kind: "expired",
        message: scanFailureMessage(t, "after_window"),
      }
    case "wrong_event":
    case "invalid":
      return {
        kind: "failed",
        message: scanFailureMessage(t, log.failure_reason),
      }
    default:
      return {
        kind: "failed",
        message: t("errors.scanValidationFailed"),
      }
  }
}
