import { getApkDownloadUrl, getApkManifestUrl } from "@/platform/detect"

interface ReleaseManifest {
  version: string
  sha256: string
  url: string
  releasedAt: string
}

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export async function downloadVerifiedApk(): Promise<{ ok: true } | { ok: false; reason: "manifest" | "download" | "integrity" }> {
  let manifest: ReleaseManifest
  try {
    const manifestRes = await fetch(getApkManifestUrl(), { cache: "no-store" })
    if (!manifestRes.ok) return { ok: false, reason: "manifest" }
    manifest = (await manifestRes.json()) as ReleaseManifest
    if (!manifest.sha256) return { ok: false, reason: "manifest" }
  } catch {
    return { ok: false, reason: "manifest" }
  }

  let apkBuffer: ArrayBuffer
  try {
    const apkRes = await fetch(getApkDownloadUrl(), { cache: "no-store" })
    if (!apkRes.ok) return { ok: false, reason: "download" }
    apkBuffer = await apkRes.arrayBuffer()
  } catch {
    return { ok: false, reason: "download" }
  }

  const hash = await sha256Hex(apkBuffer)
  if (hash.toLowerCase() !== manifest.sha256.toLowerCase()) {
    return { ok: false, reason: "integrity" }
  }

  const blob = new Blob([apkBuffer], { type: "application/vnd.android.package-archive" })
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = objectUrl
  anchor.download = "scanner-latest.apk"
  anchor.rel = "noopener"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)

  return { ok: true }
}
