import { RotateCcw, ShieldCheck } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { AuthFormCard } from "@/components/auth/AuthFormCard"
import { OtpExpiryCountdown } from "@/components/auth/OtpExpiryCountdown"
import { PasswordResetStepper } from "@/components/auth/PasswordResetStepper"
import { authOtpInputClass } from "@/components/auth/authFormStyles"
import { BackArrow, ForwardArrow } from "@/components/common/DirectionalIcons"
import { useForgotPasswordMutation } from "@/features/auth/authApi"
import {
  patchPasswordResetSession,
  readPasswordResetSession,
} from "@/features/auth/passwordResetSession"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useZodForm } from "@/hooks/useZodForm"
import { AuthLayout } from "@/layouts/AuthLayout"
import { parseApiError } from "@/shared/lib/parseApiError"
import {
  createOtpVerifyFormSchema,
  type OtpVerifyFormValues,
} from "@/shared/schemas/passwordReset"

export function ResetPasswordVerifyPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const session = readPasswordResetSession()
  const [resendCode, { isLoading: isResending }] = useForgotPasswordMutation()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useZodForm<OtpVerifyFormValues>(createOtpVerifyFormSchema, {
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
      toast.success(result.message || t("reset.verify.resendSuccessFallback"))
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
        eyebrow={t("reset.eyebrow")}
        tagline={t("reset.stepOf", { step: 2 })}
        title={t("reset.verify.title")}
        description={t("reset.verify.description", { email: maskedEmail })}
      >
        <PasswordResetStepper currentStep={2} />
        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
          <OtpExpiryCountdown sentAt={session.sentAt} />

          <div className="space-y-2">
            <Label htmlFor="rp-otp" className="text-sm font-semibold text-ink-60">
              {t("reset.verify.codeLabel")}
            </Label>
            <Input
              id="rp-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder={t("reset.verify.codePlaceholder")}
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
              <p className="text-xs text-ink-40">{t("reset.verify.codeHint")}</p>
            )}
          </div>

          <Button
            type="submit"
            size="xl"
            className="mt-1 w-full gap-2.5 shadow-card-md active:scale-[0.98]"
          >
            {t("common.continue")}
            <ForwardArrow className="size-5 shrink-0" strokeWidth={2} aria-hidden />
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 border-ink-10 bg-white text-ink shadow-card-sm active:scale-[0.98]"
            disabled={isResending}
            onClick={() => void handleResend()}
          >
            <RotateCcw className="size-4" strokeWidth={2} aria-hidden />
            {isResending ? t("reset.verify.resending") : t("reset.verify.resend")}
          </Button>

          <Button
            asChild
            type="button"
            variant="ghost"
            className="w-full gap-2 text-ink-60 hover:text-ink"
          >
            <Link to="/forgot-password">
              <BackArrow className="size-4" strokeWidth={2} aria-hidden />
              {t("reset.verify.differentEmail")}
            </Link>
          </Button>
        </form>
      </AuthFormCard>
    </AuthLayout>
  )
}
