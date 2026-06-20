import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics"

import { isNativePlatform } from "@/platform/detect"

export async function hapticScanSuccess(): Promise<void> {
  if (!isNativePlatform()) {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([40, 30, 40])
    }
    return
  }
  await Haptics.notification({ type: NotificationType.Success })
}

export async function hapticScanFailure(): Promise<void> {
  if (!isNativePlatform()) {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(80)
    }
    return
  }
  await Haptics.notification({ type: NotificationType.Error })
}

export async function hapticLightTap(): Promise<void> {
  if (!isNativePlatform()) return
  await Haptics.impact({ style: ImpactStyle.Light })
}
