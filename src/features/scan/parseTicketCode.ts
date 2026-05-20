export interface ParsedTicketCode {
  ticketCode?: string
  eventId?: number
  signature?: string
}

/**
 * Parses QR / manual payloads into API `ticket_code`.
 * Supports production ticket codes (e.g. TIC-…) and legacy dev formats.
 */
export function parseTicketCode(raw: string): ParsedTicketCode {
  const t = raw.trim()
  if (!t) return {}

  try {
    const j = JSON.parse(t) as Record<string, unknown>
    const code =
      typeof j.ticket_code === "string"
        ? j.ticket_code
        : typeof j.ticketCode === "string"
          ? j.ticketCode
          : typeof j.ticketId === "string"
            ? j.ticketId
            : undefined
    if (code) {
      return {
        ticketCode: code,
        signature: typeof j.signature === "string" ? j.signature : typeof j.secret === "string" ? j.secret : undefined,
        eventId: typeof j.event_id === "number" ? j.event_id : typeof j.eventId === "number" ? j.eventId : undefined,
      }
    }
  } catch {
    // not JSON
  }

  const deep = /^myticket:\/\/t\/([^?#]+)\?([^#]*)$/i.exec(t)
  if (deep) {
    const ticketCode = decodeURIComponent(deep[1])
    const params = new URLSearchParams(deep[2])
    const eventRaw = params.get("e")
    return {
      ticketCode,
      signature: params.get("s") ?? undefined,
      eventId: eventRaw ? Number.parseInt(eventRaw, 10) : undefined,
    }
  }

  if (/^[a-z0-9-]+$/i.test(t) && t.length <= 80) {
    return { ticketCode: t }
  }

  return {}
}

export function buildQrPayload(ticketCode: string, secret: string, eventId: number): string {
  const q = new URLSearchParams({ s: secret, e: String(eventId) })
  return `myticket://t/${encodeURIComponent(ticketCode)}?${q.toString()}`
}
