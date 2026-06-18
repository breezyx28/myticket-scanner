import type { TFunction } from "i18next"
import { z } from "zod"

export const OTP_EXPIRES_MINUTES = 15

export const createForgotPasswordFormSchema = (t: TFunction) =>
  z.object({
    email: z.string().trim().email(t("validation.emailInvalid")),
  })

export type ForgotPasswordFormValues = z.infer<ReturnType<typeof createForgotPasswordFormSchema>>

export const forgotPasswordRequestSchema = z.object({
  email: z.string().trim().email(),
})

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>

export const createOtpVerifyFormSchema = (t: TFunction) =>
  z.object({
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, t("validation.otpInvalid")),
  })

export type OtpVerifyFormValues = z.infer<ReturnType<typeof createOtpVerifyFormSchema>>

export const createNewPasswordFieldsSchema = (t: TFunction) =>
  z.object({
    password: z.string().min(8, t("validation.passwordMin")),
    confirmPassword: z.string().min(1, t("validation.confirmPasswordRequired")),
  })

export const createNewPasswordFormSchema = (t: TFunction) =>
  createNewPasswordFieldsSchema(t).refine((v) => v.password === v.confirmPassword, {
    message: t("validation.passwordsMismatch"),
    path: ["confirmPassword"],
  })

export type NewPasswordFormValues = z.infer<ReturnType<typeof createNewPasswordFormSchema>>

export const createResetPasswordFieldsSchema = (t: TFunction) =>
  z.object({
    email: z.string().trim().email(t("validation.emailInvalid")),
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, t("validation.otpInvalid")),
    password: z.string().min(8, t("validation.passwordMin")),
    confirmPassword: z.string().min(1, t("validation.confirmPasswordRequired")),
  })

export const createResetPasswordFormSchema = (t: TFunction) =>
  createResetPasswordFieldsSchema(t).refine((v) => v.password === v.confirmPassword, {
    message: t("validation.passwordsMismatch"),
    path: ["confirmPassword"],
  })

export type ResetPasswordFormValues = z.infer<ReturnType<typeof createResetPasswordFormSchema>>

export const resetPasswordRequestSchema = z.object({
  email: z.string().trim().email(),
  otp: z.string().trim().regex(/^\d{6}$/),
  password: z.string().min(8),
})

export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>
