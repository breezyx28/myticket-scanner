import { BiometricAuth, BiometryType } from "@aparajita/capacitor-biometric-auth"
import { Preferences } from "@capacitor/preferences"

import { loadSessionAsync } from "@/features/auth/session"
import { isNativePlatform } from "@/platform/detect"

const BIOMETRIC_ENABLED_KEY = "myticket-scanner-biometric-enabled"

export async function isBiometricAvailable(): Promise<boolean> {
  if (!isNativePlatform()) return false
  try {
    const result = await BiometricAuth.checkBiometry()
    const hasBiometry =
      result.isAvailable ||
      result.strongBiometryIsAvailable ||
      (result.biometryType !== BiometryType.none && result.biometryTypes.length > 0)
    return hasBiometry && result.deviceIsSecure
  } catch {
    return false
  }
}

export async function isBiometricLoginEnabled(): Promise<boolean> {
  if (!isNativePlatform()) return false
  const { value } = await Preferences.get({ key: BIOMETRIC_ENABLED_KEY })
  return value === "true"
}

export async function enableBiometricLogin(): Promise<boolean> {
  if (!isNativePlatform()) return false
  const available = await isBiometricAvailable()
  if (!available) return false

  const session = await loadSessionAsync()
  if (!session?.token) return false

  await Preferences.set({ key: BIOMETRIC_ENABLED_KEY, value: "true" })
  return true
}

export async function clearBiometricLogin(): Promise<void> {
  if (!isNativePlatform()) return
  await Preferences.remove({ key: BIOMETRIC_ENABLED_KEY })
}

export async function authenticateWithBiometric(options: {
  reason: string
  cancelTitle: string
  title?: string
}): Promise<string | null> {
  if (!isNativePlatform()) return null

  const enabled = await isBiometricLoginEnabled()
  if (!enabled) return null

  try {
    await BiometricAuth.authenticate({
      reason: options.reason,
      cancelTitle: options.cancelTitle,
      androidTitle: options.title ?? options.reason,
      allowDeviceCredential: false,
    })

    const session = await loadSessionAsync()
    return session?.token ?? null
  } catch {
    return null
  }
}
