const DEFAULT_API_BASE_URL = "https://myticket-api.kat-jr.com/api/v1/scanner"

export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.replace(/\/$/, "")
  }
  return DEFAULT_API_BASE_URL
}
