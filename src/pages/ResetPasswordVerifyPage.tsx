import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, RotateCcw, ShieldCheck } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { AuthFormCard } from "@/components/auth/AuthFormCard"
import { OtpExpiryCountdown } from "@/components/auth/OtpExpiryCountdown"
import { PasswordResetStepper } from "@/components/auth/PasswordResetStepper"
import { authOtpInputClass } from "@/components/auth/authFormStyles"
import { useForgotPasswordMutation } from "@/features/auth/authApi"
import {
  patchPasswordResetSession,
  readPasswordResetSession,
} from "@/features/auth/passwordResetSession"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/layouts/AuthLayout"
import { parseApiError } from "@/shared/lib/parseApiError"
import { otpVerifyFormSchema, type OtpVerifyFormValues } from "@/shared/schemas/passwordReset"

export function ResetPasswordVerifyPage() {
  const navigate = useNavigate()
  const session = readPasswordResetSession()
  const [resendCode, { isLoading: isResending }] = useForgotPasswordMutation()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OtpVerifyFormValues>({
    resolver: zodResolver(otpVerifyFormSchema),
    defaultValues: { otp: "" },
  })

  if (!session?.email || !session.sentAt) {
    return <Navigate to="/forgot-password" replace />
  }

  const maskedEmail = session.email.replace(/^(.{2}).*(@.*)$/, "$1••••$2")

  const onSubmit = handleSubmit((values) => {
    patchPasswordResetSession({ otp: values.otp.trim() })
    navigate("/reset-password/new")
  })

  const handleResend = async () => {
    try {
      const result = await resendCode({ email: session.email }).unwrap()
      toast.success(result.message || "If the account exists, a verification code has been sent.")
      patchPasswordResetSession({ sentAt: new Date().getTime(), otp: undefined })
      setValue("otp", "")
    } catch (error) {
      toast.error(parseApiError(error).message)
    }
  }

  return (
    <AuthLayout>
      <AuthFormCard
        icon={ShieldCheck}
        eyebrow="Account recovery"
        tagline="Step 2 of 3"
        title="Enter verification code"
        description={`We sent a 6-digit code to ${maskedEmail}. Codes expire in 15 minutes.`}
      >
        <PasswordResetStepper currentStep={2} />
        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
          <OtpExpiryCountdown sentAt={session.sentAt} />

          <div className="space-y-2">
            <Label htmlFor="rp-otp" className="text-sm font-semibold text-ink-60">
              Verification code
            </Label>
            <Input
              id="rp-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              className={authOtpInputClass}
              aria-invalid={Boolean(errors.otp)}
              {...register("otp", {
                onChange: (e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 6)
                  e.target.value = digits
                  setValue("otp", digits, { shouldValidate: true })
                },
              })}
            />
            {errors.otp ? (
              <p className="text-xs font-medium text-red-600" role="alert">
                {errors.otp.message}
              </p>
            ) : (
              <p className="text-xs text-ink-40">Enter all 6 digits — no spaces required.</p>
            )}
          </div>

          <Button
            type="submit"
            size="xl"
            className="mt-1 w-full gap-2.5 shadow-card-md active:scale-[0.98]"
          >
            Continue
            <ArrowRight className="size-5 shrink-0" strokeWidth={2} aria-hidden />
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 border-ink-10 bg-white text-ink shadow-card-sm active:scale-[0.98]"
            disabled={isResending}
            onClick={() => void handleResend()}
          >
            <RotateCcw className="size-4" strokeWidth={2} aria-hidden />
            {isResending ? "Sending new code…" : "Resend code"}
          </Button>

          <Button
            asChild
            type="button"
            variant="ghost"
            className="w-full gap-2 text-ink-60 hover:text-ink"
          >
            <Link to="/forgot-password">
              <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
              Use a different email
            </Link>
          </Button>
        </form>
      </AuthFormCard>
    </AuthLayout>
  )
}
