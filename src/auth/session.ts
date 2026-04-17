import type { MockUser } from "@/mocks/types"

const STORAGE_KEY = "myticket-scanner-session-v1"

export interface StoredSession {
  email: string
  selectedEventId: string
}

export function loadSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
  }
}

export function saveSession(data: StoredSession): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function clearSession(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function resolveUserFromSession(
  users: MockUser[],
  stored: StoredSession | null,
): MockUser | null {
  if (!stored) return null
  return users.find((u) => u.email === stored.email) ?? null
}
