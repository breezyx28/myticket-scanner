import { getAcceptLanguage, getApiBaseUrl } from "./env"

export interface ApiResponse<T = unknown> {
  status: number
  body: T
  ok: boolean
}

export interface RequestOptions {
  method?: string
  token?: string | null
  body?: unknown
  acceptLanguage?: "ar" | "en"
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Language": options.acceptLanguage ?? getAcceptLanguage(),
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json"
  }

  const response = await fetch(url, {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  const text = await response.text()
  let body: T
  try {
    body = text ? (JSON.parse(text) as T) : ({} as T)
  } catch {
    body = text as T
  }

  return {
    status: response.status,
    body,
    ok: response.ok,
  }
}
