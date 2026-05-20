import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ArrowRight, ShieldOff } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { useLoginMutation } from "@/features/auth/authApi"
import { handleLoginResponse } from "@/features/auth/bootstrapSession"
import { selectIsAuthenticated } from "@/features/auth/authSlice"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/layouts/AuthLayout"
import { parseApiError } from "@/shared/lib/parseApiError"
import { loginFormSchema, type LoginFormValues } from "@/shared/schemas/auth"
import { cn } from "@/lib/utils"

const inputClass =
  "rounded-2xl border-ink-10 bg-white text-ink shadow-card-sm placeholder:text-ink-40 focus-visible:border-ink/25 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-ink/15"

const DEMO_EMAIL = import.meta.env.DEV ? "scanner@demo.com" : ""
const DEMO_PASSWORD = import.meta.env.DEV ? "" : ""

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
    defaultValues: {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    },
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
        } else if (boot.message.toLowerCase().includes("permission") || boot.message.toLowerCase().includes("scanner")) {
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
      <Card className="border border-ink-10 bg-white shadow-card-sm">
        <CardHeader className="space-y-3 px-6 pb-2 pt-8 sm:px-8 sm:pt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-40">
            Scanner access
          </p>
          <CardTitle className="text-[1.75rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink sm:text-4xl">
            Sign in
          </CardTitle>
          <CardDescription className="max-w-[34ch] text-base leading-relaxed text-ink-60">
            Use your scanner account credentials. Sign-in connects to the production API.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8 pt-2 sm:px-8 sm:pb-10">
          <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
            {accessDenied ? (
              <Alert
                variant="destructive"
                className={cn(
                  "border-red-200/80 bg-red-50 text-red-900",
                  "[&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-red-600",
                )}
              >
                <ShieldOff className="size-4" strokeWidth={2} aria-hidden />
                <AlertTitle className="text-red-950">Access denied</AlertTitle>
                <AlertDescription className="text-red-800/90">
                  This app is for scanner accounts only. Contact your organizer if you need access.
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-ink-60">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                className={inputClass}
                placeholder="you@venue.com"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <div className="flex min-h-[44px] items-end justify-between gap-3">
                <Label htmlFor="password" className="text-ink-60">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="pb-0.5 text-xs font-semibold text-ink underline-offset-2 hover:underline focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className={inputClass}
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              ) : null}
            </div>
            <Button type="submit" size="lg" className="mt-1 w-full gap-2.5 shadow-card-sm" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="size-5 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                  Signing in…
                </>
              ) : (
                <>
                  Continue to scanner
                  <ArrowRight className="size-5 shrink-0" strokeWidth={2} aria-hidden />
                </>
              )}
            </Button>
            {import.meta.env.DEV ? (
              <p className="flex items-start gap-2 text-center text-xs leading-relaxed text-ink-40">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                Dev mode: use real scanner API credentials (demo prefill removed unless set in form).
              </p>
            ) : (
              <p className="text-center text-xs leading-relaxed text-ink-40">
                Need credentials? Ask your event organizer — scanners cannot self-register.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
