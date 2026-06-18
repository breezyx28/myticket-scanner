import type { TFunction } from "i18next"
import { z } from "zod"

export const createLoginFormSchema = (t: TFunction) =>
  z.object({
    email: z.string().trim().email(t("validation.emailInvalid")),
    password: z.string().min(1, t("validation.passwordRequired")),
  })

export type LoginFormValues = z.infer<ReturnType<typeof createLoginFormSchema>>

export const createLoginRequestSchema = (t: TFunction) =>
  z
    .object({
      email: z.string().email().optional(),
      phone: z.string().max(20).optional(),
      password: z.string().min(1),
      otp: z.string().optional(),
    })
    .refine((v) => Boolean(v.email) || Boolean(v.phone), {
      message: t("validation.emailOrPhoneRequired"),
      path: ["email"],
    })

export type LoginRequest = z.infer<ReturnType<typeof createLoginRequestSchema>>

export const authUserSchema = z.object({
  id: z.number(),
  email: z.string().nullable().optional(),
  full_name: z.string().nullable().optional(),
  role: z.string(),
})

export type AuthUser = z.infer<typeof authUserSchema>

export const loginSuccessSchema = z.object({
  token: z.string(),
  refresh_token: z.null().optional(),
  expires_at: z.string().nullable().optional(),
  user: authUserSchema,
})

export type LoginSuccess = z.infer<typeof loginSuccessSchema>

export const login2faChallengeSchema = z.object({
  challenge_token: z.string(),
  two_factor_required: z.literal(true),
})

export type Login2faChallenge = z.infer<typeof login2faChallengeSchema>

export const loginResponseSchema = z.union([loginSuccessSchema, login2faChallengeSchema])

export type LoginResponse = z.infer<typeof loginResponseSchema>

export const refreshTokenResponseSchema = z.object({
  token: z.string(),
})

export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>
