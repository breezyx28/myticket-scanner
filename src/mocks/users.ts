import type { MockUser } from "./types"

export const MOCK_USERS: MockUser[] = [
  {
    email: "scanner@demo.com",
    password: "scanner123",
    isScanner: true,
    assignedEventIds: ["evt-summer-jazz", "evt-indie-fest"],
  },
  {
    email: "organizer@demo.com",
    password: "organizer123",
    isScanner: false,
    assignedEventIds: [],
  },
]
