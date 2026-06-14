import { getApiBaseUrl } from "@/config/env"

export interface ReverbConfig {
  key: string
  host: string
  wsPort: number
  wssPort: number
  forceTls: boolean
}

function parsePort(raw: string | undefined, fallback: number): number {
  if (typeof raw !== "string" || raw.trim().length === 0) return fallback
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function isReverbConfigured(): boolean {
  const key = import.meta.env.VITE_REVERB_APP_KEY
  return typeof key === "string" && key.trim().length > 0
}

export function getReverbConfig(): ReverbConfig {
  const scheme = import.meta.env.VITE_REVERB_SCHEME ?? "https"
  const defaultPort = scheme === "https" ? 443 : 80
  const port = parsePort(import.meta.env.VITE_REVERB_PORT, defaultPort)

  return {
    key: import.meta.env.VITE_REVERB_APP_KEY?.trim() ?? "",
    host: import.meta.env.VITE_REVERB_HOST?.trim() || "localhost",
    wsPort: port,
    wssPort: port,
    forceTls: scheme === "https",
  }
}

export function getBroadcastingAuthUrl(): string {
  const explicit = import.meta.env.VITE_BROADCAST_AUTH_URL
  if (typeof explicit === "string" && explicit.trim().length > 0) {
    return explicit.replace(/\/$/, "")
  }

  const apiBase = getApiBaseUrl()
  try {
    return `${new URL(apiBase).origin}/broadcasting/auth`
  } catch {
    return "/broadcasting/auth"
  }
}
