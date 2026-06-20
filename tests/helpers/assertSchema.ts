import type { ZodType } from "zod"

export function assertSchema<T>(schema: ZodType<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error(
      `${label} schema validation failed: ${result.error.issues.map((i) => i.message).join("; ")}`,
    )
  }
  return result.data
}
