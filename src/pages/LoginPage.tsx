import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, QrCode, ShieldOff } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { useLoginMutation } from "@/features/auth/authApi"
import { handleLoginResponse } from "@/features/auth/bootstrapSession"
import { selectIsAuthenticated } from "@/features/auth/authSlice"
import { AuthFormCard } from "@/components/auth/AuthFormCard"
import { authInputClass } from "@/components/auth/authFormStyles"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/layouts/AuthLayout"
import { parseApiError } from "@/shared/lib/parseApiError"
import { loginFormSchema, type LoginFormValues } from "@/shared/schemas/auth"
import { cn } from "@/lib/utils"

export function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const [login, { isLoading }] = useLoginMutation()
  const [accessDenied, setAccessDenied] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  })

  if (isAuthenticated) return <Navigate to="/" replace />

  const onSubmit = handleSubmit(async (values) => {
    setAccessDenied(false)
    try {
      const response = await login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      }).unwrap()

      const boot = await handleLoginResponse(dispatch, response)
      if (!boot.ok) {
        if (boot.twoFactor) {
          toast.error(boot.message)
        } else if (
          boot.message.toLowerCase().includes("permission") ||
          boot.message.toLowerCase().includes("scanner")
        ) {
          setAccessDenied(true)
        } else {
          toast.error(boot.message)
        }
        return
      }

      navigate("/", { replace: true })
    } catch (error) {
      const parsed = parseApiError(error)
      if (parsed.status === 403) {
        setAccessDenied(true)
        return
      }
      toast.error(parsed.message)
    }
  })

  return (
    <AuthLayout>
      <AuthFormCard
        icon={QrCode}
        eyebrow="Scanner access"
        tagline="Sign in to validate tickets at the gate"
        title="Welcome back"
        description="Use your scanner account credentials."
      >
        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
          {accessDenied ? (
            <Alert
              variant="destructive"
              className={cn(
                "rounded-2xl border-red-200/90 bg-red-50 text-red-900",
                "[&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-red-600",
              )}
            >
              <ShieldOff className="size-4" strokeWidth={2} aria-hidden />
              <AlertTitle className="font-bold text-red-950">Access denied</AlertTitle>
              <AlertDescription className="text-sm leading-relaxed text-red-800/90">
                This app is for scanner accounts only. Contact your organizer if you need access.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-ink-60">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
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

          <div className="space-y-2">
            <div className="flex min-h-[44px] items-end justify-between gap-3">
              <Label htmlFor="password" className="text-sm font-semibold text-ink-60">
                Password
              </Label>
              <Link
                to="/forgot-password"
                className="pb-0.5 text-xs font-semibold text-coral underline-offset-2 transition-colors hover:text-coral-dark hover:underline focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className={authInputClass}
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-xs font-medium text-red-600" role="alert">
                {errors.password.message}
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
                Signing in…
              </>
            ) : (
              <>
                Continue to scanner
                <ArrowRight className="size-5 shrink-0" strokeWidth={2} aria-hidden />
              </>
            )}
          </Button>

          <p className="text-center text-xs leading-relaxed text-ink-40">
            Scanner accounts only. Need access? Contact your event organizer.
          </p>
        </form>
      </AuthFormCard>
    </AuthLayout>
  )
}
