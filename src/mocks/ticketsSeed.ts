import type { MockTicket } from "./types"

/** Initial seed — copied into mutable store on load / reset */
export const TICKETS_SEED: MockTicket[] = [
  {
    id: "tck-001",
    eventId: "evt-summer-jazz",
    holderName: "Amina Rahman",
    section: "A",
    seat: "12",
    type: "VIP",
    status: "active",
    secret: "alpha",
  },
  {
    id: "tck-002",
    eventId: "evt-summer-jazz",
    holderName: "Jon Rivera",
    section: "B",
    seat: "4",
    type: "General",
    status: "used",
    secret: "bravo",
  },
  {
    id: "tck-003",
    eventId: "evt-indie-fest",
    holderName: "Maya Chen",
    section: "Lawn",
    seat: "—",
    type: "Early bird",
    status: "active",
    secret: "charlie",
  },
  {
    id: "tck-expired",
    eventId: "evt-indie-fest",
    holderName: "Sam Okonkwo",
    section: "C",
    seat: "88",
    type: "General",
    status: "expired",
    secret: "delta",
  },
]
