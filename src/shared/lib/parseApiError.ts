import type { FetchBaseQueryError } from "@reduxjs/toolkit/query"

import i18n from "@/i18n/config"
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
  const t = i18n.t.bind(i18n)

  if (!error || typeof error !== "object" || !("status" in error)) {
    return { status: "CUSTOM_ERROR", message: t("errors.generic") }
  }

  const fetchError = error as FetchBaseQueryError
  const status = fetchError.status

  if (status === "FETCH_ERROR") {
    return { status, message: t("errors.network") }
  }

  if (typeof status !== "number") {
    return { status, message: t("errors.requestFailed") }
  }

  const data = "data" in fetchError ? fetchError.data : undefined
  const parsed = apiErrorSchema.safeParse(data)
  const message = parsed.success
    ? parsed.data.message
    : status === 429
      ? t("errors.tooManyAttempts")
      : status === 401
        ? t("errors.sessionExpired")
        : status === 403
          ? t("errors.forbidden")
          : status === 422
            ? t("errors.validationFailed")
            : t("errors.requestFailed")

  return {
    status,
    message,
    fieldErrors: parsed.success ? parsed.data.errors : undefined,
  }
}
