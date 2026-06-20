import { config as loadEnv } from "dotenv"
import path from "node:path"

loadEnv({ path: path.resolve(process.cwd(), ".env.test"), quiet: true })
loadEnv({ path: path.resolve(process.cwd(), ".env"), quiet: true })

const DEFAULT_API_BASE_URL = "https://myticket-api.kat-jr.com/api/v1/scanner"

export function getApiBaseUrl(): string {
  const raw = process.env.VITE_API_BASE_URL
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.replace(/\/$/, "")
  }
  return DEFAULT_API_BASE_URL
}

export function getAcceptLanguage(): "ar" | "en" {
  const raw = process.env.TEST_ACCEPT_LANGUAGE?.trim().toLowerCase()
  return raw === "ar" ? "ar" : "en"
}

export function getScannerCredentials(): { email: string; password: string } | null {
  const email = process.env.TEST_SCANNER_EMAIL?.trim()
  const password = process.env.TEST_SCANNER_PASSWORD
  if (!email || !password) return null
  return { email, password }
}

export function hasScannerCredentials(): boolean {
  return getScannerCredentials() !== null
}

export function getOptionalTicketCode(): string | null {
  const code = process.env.TEST_TICKET_CODE?.trim()
  return code && code.length > 0 ? code : null
}

export function getOptionalEventId(): number | null {
  const raw = process.env.TEST_EVENT_ID?.trim()
  if (!raw) return null
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) && id > 0 ? id : null
}

export function requireCredentials(): { email: string; password: string } {
  const creds = getScannerCredentials()
  if (!creds) {
    throw new Error(
      "Missing TEST_SCANNER_EMAIL / TEST_SCANNER_PASSWORD in .env.test — copy .env.test.example",
    )
  }
  return creds
}

export function getTestEnvMeta() {
  return {
    apiBaseUrl: getApiBaseUrl(),
    credentialsConfigured: Boolean(getScannerCredentials()),
    realTicketEnabled: Boolean(getOptionalTicketCode()),
    acceptLanguage: getAcceptLanguage(),
  }
}
