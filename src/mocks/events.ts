import type { MockEvent } from "./types"

export const MOCK_EVENTS: MockEvent[] = [
  {
    id: "evt-summer-jazz",
    name: "Summer Jazz Night",
    venue: "Blue Note Hall",
    endsAt: "2026-12-31T23:59:59.000Z",
    scanMode: "one_time",
  },
  {
    id: "evt-indie-fest",
    name: "Indie Open Air",
    venue: "Riverside Park",
    endsAt: "2027-09-01T22:00:00.000Z",
    scanMode: "multi_scan",
  },
]
