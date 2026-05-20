import type { Assignment } from "@/shared/schemas/scanner"
import type { ScanLog } from "@/shared/schemas/scanner"

import type { ScanResultDetail } from "./types"

const FAILURE_MESSAGES: Record<string, string> = {
  scanner_not_assigned: "Scanner is not assigned to this event.",
  ticket_not_found: "Ticket not found or invalid.",
  ticket_from_other_event: "This ticket is for another event.",
  before_window: "Entry is not open yet for this event.",
  after_window: "This event has ended.",
  already_scanned: "This ticket was already scanned.",
  ticket_status_invalid: "Ticket status is not valid for entry.",
}

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
        message: FAILURE_MESSAGES.after_window,
      }
    case "wrong_event":
    case "invalid":
      return {
        kind: "failed",
        message:
          (log.failure_reason && FAILURE_MESSAGES[log.failure_reason]) ||
          "Ticket not found or could not be validated.",
      }
    default:
      return {
        kind: "failed",
        message: "Unable to validate this ticket.",
      }
  }
}
