import type { Assignment } from "@/shared/schemas/scanner"
import type { ScanLog } from "@/shared/schemas/scanner"

import { scanFailureMessage } from "./scanFailureMessages"
import type { ScanResultDetail } from "./types"

function eventTitle(assignment: Assignment | null | undefined): string {
  return assignment?.event?.title ?? "Event"
}

export function mapScanLogToResult(
  log: ScanLog,
  assignment: Assignment | null | undefined,
): ScanResultDetail {
  const eventName = eventTitle(assignment)

  switch (log.result) {
    case "ok":
      return {
        kind: "success",
        holderName: log.holder_name_snapshot ?? "Guest",
        eventName,
        venue: assignment?.event?.code ?? "",
        section: log.seat_label_snapshot?.split("-")[0]?.trim() || "—",
        seat: log.seat_label_snapshot ?? "—",
        ticketType: log.ticket_type_snapshot ?? "Ticket",
      }
    case "duplicate":
      return {
        kind: "used",
        holderName: log.holder_name_snapshot ?? "Guest",
        eventName,
      }
    case "expired":
      return {
        kind: "expired",
        message: scanFailureMessage("after_window"),
      }
    case "wrong_event":
    case "invalid":
      return {
        kind: "failed",
        message: scanFailureMessage(log.failure_reason),
      }
    default:
      return {
        kind: "failed",
        message: "Unable to validate this ticket.",
      }
  }
}
