import { Preferences } from "@capacitor/preferences"
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin"

import { isNativePlatform } from "@/platform/detect"
import type { StoredSession } from "@/features/auth/session"

const SESSION_KEY = "myticket-scanner-session-v1"
const TOKEN_KEY = "myticket-scanner-token"

export async function loadSessionAsync(): Promise<StoredSession | null> {
  if (!isNativePlatform()) return null

  try {
    const meta = await Preferences.get({ key: SESSION_KEY })
    if (!meta.value) return null

    const parsed = JSON.parse(meta.value) as Omit<StoredSession, "token"> & { token?: string }
    const tokenResult = await SecureStoragePlugin.get({ key: TOKEN_KEY })
    const token = tokenResult.value
    if (!token || typeof parsed.userId !== "number") return null

    return {
      token,
      userId: parsed.userId,
      email: parsed.email ?? null,
      fullName: parsed.fullName ?? null,
      deviceId: parsed.deviceId ?? null,
      selectedEventId: parsed.selectedEventId ?? null,
    }
  } catch {
    return null
  }
}

export async function saveSessionAsync(data: StoredSession): Promise<void> {
  if (!isNativePlatform()) return

  const { token, ...meta } = data
  await SecureStoragePlugin.set({ key: TOKEN_KEY, value: token })
  await Preferences.set({
    key: SESSION_KEY,
    value: JSON.stringify(meta),
  })
}

export async function clearSessionAsync(): Promise<void> {
  if (!isNativePlatform()) return

  try {
    await SecureStoragePlugin.remove({ key: TOKEN_KEY })
  } catch {
    /* not stored */
  }
  await Preferences.remove({ key: SESSION_KEY })
}
