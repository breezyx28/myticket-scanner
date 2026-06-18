import { Mail } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { AuthFormCard } from "@/components/auth/AuthFormCard"
import { PasswordResetStepper } from "@/components/auth/PasswordResetStepper"
import { authInputClass } from "@/components/auth/authFormStyles"
import { BackArrow, ForwardArrow } from "@/components/common/DirectionalIcons"
import { useForgotPasswordMutation } from "@/features/auth/authApi"
import { writePasswordResetSession } from "@/features/auth/passwordResetSession"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useZodForm } from "@/hooks/useZodForm"
import { AuthLayout } from "@/layouts/AuthLayout"
import { parseApiError } from "@/shared/lib/parseApiError"
import {
  createForgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from "@/shared/schemas/passwordReset"

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodForm<ForgotPasswordFormValues>(createForgotPasswordFormSchema, {
    defaultValues: { email: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    const email = values.email.trim().toLowerCase()
    const sentAt = new Date().getTime()
    try {
      const result = await forgotPassword({ email }).unwrap()
      toast.success(result.message || t("reset.forgot.successFallback"))
      writePasswordResetSession({ email, sentAt })
      navigate("/reset-password/verify", { replace: true })
    } catch (error) {
      const parsed = parseApiError(error)
      if (parsed.fieldErrors?.email?.[0]) {
        toast.error(parsed.fieldErrors.email[0])
        return
      }
      toast.error(parsed.message)
    }
  })

  return (
    <AuthLayout>
      <AuthFormCard
        icon={Mail}
        eyebrow={t("reset.eyebrow")}
        tagline={t("reset.stepOf", { step: 1 })}
        title={t("reset.forgot.title")}
        description={t("reset.forgot.description")}
      >
        <PasswordResetStepper currentStep={1} />
        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="fp-email" className="text-sm font-semibold text-ink-60">
              {t("common.email")}
            </Label>
            <Input
              id="fp-email"
              type="email"
              autoComplete="email"
              className={authInputClass}
              placeholder={t("auth.login.emailPlaceholder")}
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-xs font-medium text-red-600" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <p className="text-xs leading-relaxed text-ink-40">{t("reset.forgot.securityNote")}</p>

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
                {t("reset.forgot.sending")}
              </>
            ) : (
              <>
                {t("common.continue")}
                <ForwardArrow className="size-5 shrink-0" strokeWidth={2} aria-hidden />
              </>
            )}
          </Button>

          <Button
            asChild
            type="button"
            variant="ghost"
            className="w-full gap-2 text-ink-60 hover:text-ink"
          >
            <Link to="/login">
              <BackArrow className="size-4" strokeWidth={2} aria-hidden />
              {t("reset.forgot.backToSignIn")}
            </Link>
          </Button>
        </form>
      </AuthFormCard>
    </AuthLayout>
  )
}
