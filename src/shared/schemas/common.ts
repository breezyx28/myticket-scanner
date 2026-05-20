import { z } from "zod"

export const apiErrorSchema = z.object({
  message: z.string(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
})

export const messageResponseSchema = z.object({
  message: z.string(),
})

export const dataEnvelopeSchema = <T extends z.ZodType>(inner: T) =>
  z.object({
    data: inner,
  })
