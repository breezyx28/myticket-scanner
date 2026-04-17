export interface ParsedScanPayload {
  ticketId?: string
  secret?: string
  eventId?: string
}

/**
 * Supports:
 * - `myticket://t/{ticketId}?s={secret}&e={eventId}` (e optional)
 * - JSON `{"ticketId":"...","secret":"...","eventId":"..."}`
 * - Plain ticket id (no secret check beyond empty)
 */
export function parseScanPayload(raw: string): ParsedScanPayload {
  const t = raw.trim()
  if (!t) return {}

  try {
    const j = JSON.parse(t) as Record<string, unknown>
    if (typeof j.ticketId === "string") {
      return {
        ticketId: j.ticketId,
        secret: typeof j.secret === "string" ? j.secret : undefined,
        eventId: typeof j.eventId === "string" ? j.eventId : undefined,
      }
    }
  } catch {
    // not JSON
  }

  const deep = /^myticket:\/\/t\/([^?#]+)\?([^#]*)$/i.exec(t)
  if (deep) {
    const ticketId = decodeURIComponent(deep[1])
    const params = new URLSearchParams(deep[2])
    return {
      ticketId,
      secret: params.get("s") ?? undefined,
      eventId: params.get("e") ?? undefined,
    }
  }

  if (/^[a-z0-9-]+$/i.test(t) && t.length <= 64) {
    return { ticketId: t }
  }

  return {}
}

export function buildQrPayload(ticketId: string, secret: string, eventId: string): string {
  const q = new URLSearchParams({ s: secret, e: eventId })
  return `myticket://t/${encodeURIComponent(ticketId)}?${q.toString()}`
}
