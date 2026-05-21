import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, QrCode, ShieldCheck, ShieldOff } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate } from "react-router-dom"
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

const inputClass = cn(
  "min-h-[52px] rounded-2xl border-ink-10 bg-white text-base text-ink shadow-card-sm",
  "placeholder:text-ink-40",
  "focus-visible:border-ink/20 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-ink/10",
)

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
      <Card className="overflow-hidden border-ink-10 bg-white shadow-card-lg">
        <div className="border-b border-ink-10 bg-gradient-to-br from-lemon/30 via-white to-sky/20 px-6 py-5 sm:px-8">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-lemon text-ink shadow-card-sm">
              <QrCode className="size-6" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0 space-y-1 pt-0.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-40">
                Scanner access
              </p>
              <p className="text-sm font-semibold text-ink-60">Sign in to validate tickets at the gate</p>
            </div>
          </div>
        </div>

        <CardHeader className="space-y-2 px-6 pb-0 pt-7 sm:px-8 sm:pt-8">
          <CardTitle className="text-[1.75rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink sm:text-[2rem]">
            Welcome back
          </CardTitle>
          <CardDescription className="max-w-[36ch] text-[15px] leading-relaxed text-ink-60">
            Use your scanner account on the live MyTicket API.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-8 pt-5 sm:px-8 sm:pb-10">
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
                className={inputClass}
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
              <Label htmlFor="password" className="text-sm font-semibold text-ink-60">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className={inputClass}
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
              className="mt-1 w-full gap-2.5 shadow-card-md"
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

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-10 bg-ink-5 px-3 py-1 text-[11px] font-semibold text-ink-60">
                <ShieldCheck className="size-3.5 text-teal" strokeWidth={2} aria-hidden />
                Live API
              </span>
            </div>

            <p className="text-center text-xs leading-relaxed text-ink-40">
              Need credentials? Ask your event organizer — password reset is not available in this
              app.
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
