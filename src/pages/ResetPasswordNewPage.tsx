import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { AuthFormCard } from "@/components/auth/AuthFormCard"
import { PasswordResetStepper } from "@/components/auth/PasswordResetStepper"
import { authInputClass } from "@/components/auth/authFormStyles"
import { useResetPasswordMutation } from "@/features/auth/authApi"
import {
  clearPasswordResetSession,
  readPasswordResetSession,
} from "@/features/auth/passwordResetSession"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/layouts/AuthLayout"
import { parseApiError } from "@/shared/lib/parseApiError"
import {
  newPasswordFormSchema,
  type NewPasswordFormValues,
} from "@/shared/schemas/passwordReset"

export function ResetPasswordNewPage() {
  const navigate = useNavigate()
  const session = readPasswordResetSession()
  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  if (!session?.email || !session.otp) {
    return <Navigate to="/reset-password/verify" replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await resetPassword({
        email: session.email,
        otp: session.otp!,
        password: values.password,
      }).unwrap()

      clearPasswordResetSession()
      toast.success(result.message || "Password reset successful.")
      navigate("/login", { replace: true })
    } catch (error) {
      const parsed = parseApiError(error)
      if (parsed.fieldErrors) {
        const first =
          parsed.fieldErrors.otp?.[0] ??
          parsed.fieldErrors.password?.[0] ??
          parsed.fieldErrors.email?.[0]
        if (first) {
          toast.error(first)
          if (parsed.fieldErrors.otp?.[0]) {
            navigate("/reset-password/verify")
          }
          return
        }
      }
      toast.error(parsed.message)
    }
  })

  return (
    <AuthLayout>
      <AuthFormCard
        icon={KeyRound}
        eyebrow="Account recovery"
        tagline="Step 3 of 3"
        title="Choose a new password"
        description="Create a strong password with at least 8 characters for your scanner account."
      >
        <PasswordResetStepper currentStep={3} />
        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="rp-password" className="text-sm font-semibold text-ink-60">
              New password
            </Label>
            <Input
              id="rp-password"
              type="password"
              autoComplete="new-password"
              className={authInputClass}
              placeholder="At least 8 characters"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-xs font-medium text-red-600" role="alert">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rp-confirm" className="text-sm font-semibold text-ink-60">
              Confirm password
            </Label>
            <Input
              id="rp-confirm"
              type="password"
              autoComplete="new-password"
              className={authInputClass}
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword ? (
              <p className="text-xs font-medium text-red-600" role="alert">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            size="xl"
            className="mt-1 w-full gap-2.5 shadow-card-md active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className="size-5 animate-spin rounded-full border-2 border-ink border-t-transparent"
                  aria-hidden
                />
                Updating password…
              </>
            ) : (
              <>
                Reset password
                <ArrowRight className="size-5 shrink-0" strokeWidth={2} aria-hidden />
              </>
            )}
          </Button>

          <Button
            asChild
            type="button"
            variant="ghost"
            className="w-full gap-2 text-ink-60 hover:text-ink"
          >
            <Link to="/reset-password/verify">
              <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
              Back to verification code
            </Link>
          </Button>
        </form>
      </AuthFormCard>
    </AuthLayout>
  )
}
