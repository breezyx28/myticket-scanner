import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { AuthFormCard } from "@/components/auth/AuthFormCard"
import { PasswordResetStepper } from "@/components/auth/PasswordResetStepper"
import { authInputClass } from "@/components/auth/authFormStyles"
import { useForgotPasswordMutation } from "@/features/auth/authApi"
import { writePasswordResetSession } from "@/features/auth/passwordResetSession"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/layouts/AuthLayout"
import { parseApiError } from "@/shared/lib/parseApiError"
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from "@/shared/schemas/passwordReset"

const GENERIC_SUCCESS =
  "If the account exists, a verification code has been sent to your email."

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    const email = values.email.trim().toLowerCase()
    const sentAt = new Date().getTime()
    try {
      const result = await forgotPassword({ email }).unwrap()
      toast.success(result.message || GENERIC_SUCCESS)
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
        eyebrow="Account recovery"
        tagline="Step 1 of 3"
        title="Forgot password?"
        description="Enter your scanner account email. We will send a 6-digit code if the account is eligible."
      >
        <PasswordResetStepper currentStep={1} />
        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="fp-email" className="text-sm font-semibold text-ink-60">
              Email
            </Label>
            <Input
              id="fp-email"
              type="email"
              autoComplete="email"
              className={authInputClass}
              placeholder="you@venue.com"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-xs font-medium text-red-600" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <p className="text-xs leading-relaxed text-ink-40">
            For your security we always show the same confirmation message — we never reveal
            whether an email is registered.
          </p>

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
                Sending code…
              </>
            ) : (
              <>
                Continue
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
            <Link to="/login">
              <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
              Back to sign in
            </Link>
          </Button>
        </form>
      </AuthFormCard>
    </AuthLayout>
  )
}
