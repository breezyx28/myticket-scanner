import { MOCK_EVENTS } from "./events"
import { parseScanPayload } from "./parseScanPayload"
import { findTicketById, updateTicket } from "./ticketStore"
import type { ScanResultDetail } from "./types"

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function randomDelay(): Promise<void> {
  return delay(300 + Math.floor(Math.random() * 500))
}

function eventEnded(endsAt: string): boolean {
  return Date.now() > new Date(endsAt).getTime()
}

/**
 * Validates decoded QR text against the in-memory store.
 * `selectedEventId` scopes validation to the scanner's chosen gate context.
 */
export async function validateScan(
  raw: string,
  selectedEventId: string,
): Promise<ScanResultDetail> {
  await randomDelay()

  const parsed = parseScanPayload(raw)
  const ticketId = parsed.ticketId
  if (!ticketId) {
    return { kind: "failed", message: "Invalid QR — no ticket reference found." }
  }

  const ticket = findTicketById(ticketId)
  if (!ticket) {
    return { kind: "failed", message: "Ticket not found or hash mismatch." }
  }

  if (parsed.secret !== undefined && parsed.secret !== ticket.secret) {
    return { kind: "failed", message: "Ticket not found or hash mismatch." }
  }

  const event = MOCK_EVENTS.find((e) => e.id === ticket.eventId)
  if (!event) {
    return { kind: "failed", message: "Event configuration missing." }
  }

  const payloadEvent = parsed.eventId
  if (payloadEvent && payloadEvent !== ticket.eventId) {
    return { kind: "failed", message: "Ticket not found or hash mismatch." }
  }

  if (ticket.eventId !== selectedEventId) {
    return {
      kind: "failed",
      message: "This ticket is not for the selected event.",
    }
  }

  if (ticket.status === "expired" || eventEnded(event.endsAt)) {
    return {
      kind: "expired",
      message: "This event has ended — entry denied.",
    }
  }

  if (event.scanMode === "one_time") {
    if (ticket.status === "used") {
      return {
        kind: "used",
        holderName: ticket.holderName,
        eventName: event.name,
      }
    }
    if (ticket.status === "active") {
      updateTicket(ticket.id, { status: "used" })
      return {
        kind: "success",
        holderName: ticket.holderName,
        eventName: event.name,
        venue: event.venue,
        section: ticket.section,
        seat: ticket.seat,
        ticketType: ticket.type,
      }
    }
  }

  // multi_scan — ticket stays active; re-scans allowed while event active
  if (event.scanMode === "multi_scan") {
    if (ticket.status === "active") {
      return {
        kind: "success",
        holderName: ticket.holderName,
        eventName: event.name,
        venue: event.venue,
        section: ticket.section,
        seat: ticket.seat,
        ticketType: ticket.type,
      }
    }
    if (ticket.status === "used") {
      return {
        kind: "success",
        holderName: ticket.holderName,
        eventName: event.name,
        venue: event.venue,
        section: ticket.section,
        seat: ticket.seat,
        ticketType: ticket.type,
      }
    }
  }

  return { kind: "failed", message: "Unable to validate this ticket." }
}
