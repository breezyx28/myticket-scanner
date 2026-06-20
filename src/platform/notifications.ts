import { LocalNotifications } from "@capacitor/local-notifications"

import { isNativePlatform } from "@/platform/detect"

let notificationId = 1

export async function showForegroundScanNotification(title: string, body: string): Promise<void> {
  if (!isNativePlatform()) return

  const id = notificationId++
  await LocalNotifications.schedule({
    notifications: [
      {
        id,
        title,
        body,
        schedule: { at: new Date(Date.now() + 300) },
        smallIcon: "ic_stat_notification",
        sound: undefined,
      },
    ],
  })
}
