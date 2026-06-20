import { App as CapacitorApp } from "@capacitor/app"
import { LocalNotifications } from "@capacitor/local-notifications"
import { SplashScreen } from "@capacitor/splash-screen"
import { StatusBar, Style } from "@capacitor/status-bar"

import { isNativePlatform } from "@/platform/detect"

export async function initNativeShell(): Promise<void> {
  if (!isNativePlatform()) return

  try {
    await StatusBar.setOverlaysWebView({ overlay: true })
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: "#0D0D0D" })
  } catch {
    /* unsupported */
  }

  try {
    await SplashScreen.hide()
  } catch {
    /* */
  }

  try {
    await LocalNotifications.requestPermissions()
  } catch {
    /* */
  }
}

export function registerNativeBackHandler(onExitRequest: () => void): () => void {
  if (!isNativePlatform()) return () => undefined

  const listener = CapacitorApp.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back()
      return
    }
    onExitRequest()
  })

  return () => {
    void listener.then((handle) => handle.remove())
  }
}
