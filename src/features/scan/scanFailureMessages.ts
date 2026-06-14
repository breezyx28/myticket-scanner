export const SCAN_FAILURE_MESSAGES: Record<string, string> = {
  scanner_not_assigned: "Scanner is not assigned to this event.",
  scanner_not_owned_by_event_organizer:
    "This scanner account is not authorized for this event's organizer.",
  ticket_not_found: "Ticket not found or invalid.",
  ticket_from_other_event: "This ticket is for another event.",
  before_window: "Entry is not open yet for this event.",
  after_window: "This event has ended.",
  already_scanned: "This ticket was already scanned.",
  ticket_status_invalid: "Ticket status is not valid for entry.",
}

export function scanFailureMessage(
  failureReason: string | null | undefined,
  fallback = "Ticket not found or could not be validated.",
): string {
  if (failureReason && SCAN_FAILURE_MESSAGES[failureReason]) {
    return SCAN_FAILURE_MESSAGES[failureReason]
  }
  return fallback
}
