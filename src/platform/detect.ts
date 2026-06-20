import { Capacitor } from "@capacitor/core"

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform()
}

export function isAndroidMobileWeb(): boolean {
  if (typeof navigator === "undefined") return false
  if (isNativePlatform()) return false
  return /Android/i.test(navigator.userAgent) && /Mobile/i.test(navigator.userAgent)
}

export function getApkManifestUrl(): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/")
  return `${base}releases/manifest.json`
}

export function getReleaseIconUrl(): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/")
  return `${base}releases/icon-512.png`
}

export function getApkDownloadUrl(): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/")
  return `${base}releases/scanner-latest.apk`
}
