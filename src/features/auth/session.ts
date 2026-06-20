import { isNativePlatform } from "@/platform/detect"
import {
  clearSessionAsync,
  loadSessionAsync,
  saveSessionAsync,
} from "@/platform/storage/nativeSessionStorage"

export const SESSION_STORAGE_KEY = "myticket-scanner-session-v1"

export interface StoredSession {
  token: string
  userId: number
  email: string | null
  fullName: string | null
  deviceId: number | null
  selectedEventId: number | null
}

export function loadSession(): StoredSession | null {
  if (isNativePlatform()) return null

  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredSession
    if (!parsed.token || typeof parsed.userId !== "number") return null
    return parsed
  } catch {
    return null
  }
}

export function saveSession(data: StoredSession): void {
  if (isNativePlatform()) {
    void saveSessionAsync(data)
    return
  }
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data))
}

export async function clearSessionAwaitable(): Promise<void> {
  if (isNativePlatform()) {
    await clearSessionAsync()
    return
  }
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
}

export function clearSession(): void {
  if (isNativePlatform()) {
    void clearSessionAsync()
    return
  }
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
}

export { loadSessionAsync }
