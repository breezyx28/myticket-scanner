import type { TFunction } from "i18next"

export function scanFailureMessage(
  t: TFunction,
  failureReason: string | null | undefined,
  fallback?: string,
): string {
  if (failureReason) {
    const key = `scanFailure.${failureReason}`
    if (t(key) !== key) return t(key)
  }
  return fallback ?? t("errors.scanValidationDefault")
}
