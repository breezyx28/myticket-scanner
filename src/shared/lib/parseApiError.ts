import type { FetchBaseQueryError } from "@reduxjs/toolkit/query"

import { apiErrorSchema } from "@/shared/schemas/common"

export interface ParsedApiError {
  status:
    | number
    | "FETCH_ERROR"
    | "PARSING_ERROR"
    | "TIMEOUT_ERROR"
    | "CUSTOM_ERROR"
  message: string
  fieldErrors?: Record<string, string[]>
}

export function parseApiError(error: unknown): ParsedApiError {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return { status: "CUSTOM_ERROR", message: "Something went wrong. Please try again." }
  }

  const fetchError = error as FetchBaseQueryError
  const status = fetchError.status

  if (status === "FETCH_ERROR") {
    return { status, message: "Network error. Check your connection and try again." }
  }

  if (typeof status !== "number") {
    return { status, message: "Request failed." }
  }

  const data = "data" in fetchError ? fetchError.data : undefined
  const parsed = apiErrorSchema.safeParse(data)
  const message = parsed.success
    ? parsed.data.message
    : status === 429
      ? "Too many attempts. Please wait and try again."
      : status === 401
        ? "Session expired. Please sign in again."
        : status === 403
          ? "You do not have permission for this action."
          : status === 422
            ? "The given data was invalid."
            : "Request failed."

  return {
    status,
    message,
    fieldErrors: parsed.success ? parsed.data.errors : undefined,
  }
}
