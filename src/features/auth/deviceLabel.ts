import i18n from "@/i18n/config"

function localizedPlatform(): string {
  if (typeof navigator === "undefined") {
    return i18n.t("auth.platformFallback")
  }

  const ua = navigator.userAgent
  const platform = "platform" in navigator ? navigator.platform : ""

  if (/iPhone|iPad|iPod/.test(ua)) return i18n.t("auth.platforms.ios")
  if (/Android/.test(ua)) return i18n.t("auth.platforms.android")
  if (platform === "Win32" || /Windows/.test(ua)) return i18n.t("auth.platforms.windows")
  if (platform === "MacIntel" || /Macintosh/.test(ua)) return i18n.t("auth.platforms.mac")
  if (/Linux/.test(ua)) return i18n.t("auth.platforms.linux")

  return i18n.t("auth.platformFallback")
}

export function defaultDeviceLabel(): string {
  return i18n.t("auth.deviceLabel", { platform: localizedPlatform() }).slice(0, 160)
}
