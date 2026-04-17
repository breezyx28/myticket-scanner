import { TICKETS_SEED } from "./ticketsSeed"
import type { MockTicket, TicketStatus } from "./types"

let tickets: MockTicket[] = structuredClone(TICKETS_SEED)

export function getTickets(): MockTicket[] {
  return tickets
}

export function findTicketById(id: string): MockTicket | undefined {
  return tickets.find((t) => t.id === id)
}

export function updateTicket(id: string, patch: Partial<MockTicket>): void {
  const i = tickets.findIndex((t) => t.id === id)
  if (i === -1) return
  tickets[i] = { ...tickets[i], ...patch }
}

export function setTicketStatus(id: string, status: TicketStatus): void {
  updateTicket(id, { status })
}

export function resetTicketStore(): void {
  tickets = structuredClone(TICKETS_SEED)
}
