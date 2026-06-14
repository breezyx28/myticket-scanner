import { z } from "zod"

export const OTP_EXPIRES_MINUTES = 15

export const forgotPasswordFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>

export const forgotPasswordRequestSchema = forgotPasswordFormSchema

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>

export const otpVerifyFormSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
})

export type OtpVerifyFormValues = z.infer<typeof otpVerifyFormSchema>

export const newPasswordFieldsSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm your password"),
})

export const newPasswordFormSchema = newPasswordFieldsSchema.refine(
  (v) => v.password === v.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  },
)

export type NewPasswordFormValues = z.infer<typeof newPasswordFormSchema>

export const resetPasswordFieldsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm your password"),
})

export const resetPasswordFormSchema = resetPasswordFieldsSchema.refine(
  (v) => v.password === v.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  },
)

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>

export const resetPasswordRequestSchema = resetPasswordFieldsSchema.pick({
  email: true,
  otp: true,
  password: true,
})

export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>
