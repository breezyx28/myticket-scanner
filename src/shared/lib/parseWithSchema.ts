import type { ZodType } from "zod"

import i18n from "@/i18n/config"

export function parseWithSchema<T>(schema: ZodType<T>, data: unknown, label: string): T {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    console.error(`[API] Invalid ${label}`, parsed.error.flatten())
    throw new Error(i18n.t("errors.invalidApiResponse", { label }))
  }
  return parsed.data
}
