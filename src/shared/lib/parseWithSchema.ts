import type { ZodType } from "zod"

export function parseWithSchema<T>(schema: ZodType<T>, data: unknown, label: string): T {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    console.error(`[API] Invalid ${label}`, parsed.error.flatten())
    throw new Error(`Invalid API response: ${label}`)
  }
  return parsed.data
}
