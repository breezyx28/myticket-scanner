import { AlertCircle, ArrowRight, ShieldOff } from "lucide-react"
import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"

import { useAuth } from "@/auth/AuthContext"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/layouts/AuthLayout"
import { cn } from "@/lib/utils"

const inputClass =
  "rounded-2xl border-ink-10 bg-white text-ink shadow-card-sm placeholder:text-ink-40 focus-visible:border-ink/25 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-ink/15"

/** Pre-filled for mock / local dev — matches README demo scanner account */
const DEMO_SCANNER_EMAIL = "scanner@demo.com"
const DEMO_SCANNER_PASSWORD = "scanner123"

export function LoginPage() {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const [email, setEmail] = useState(DEMO_SCANNER_EMAIL)
  const [password, setPassword] = useState(DEMO_SCANNER_PASSWORD)
  const [error, setError] = useState<"invalid" | "not_scanner" | null>(null)

  if (user) return <Navigate to="/" replace />

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = login(email, password)
    if (res.ok) {
      navigate("/", { replace: true })
      return
    }
    if (res.reason === "not_scanner") setError("not_scanner")
    else setError("invalid")
  }

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
            Use the email and password from your organizer. Google sign-in is not available on this
            app.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8 pt-2 sm:px-8 sm:pb-10">
          <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            {error === "not_scanner" ? (
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
                  This app is for scanner accounts only. Use organizer credentials in the organizer
                  dashboard instead.
                </AlertDescription>
              </Alert>
            ) : null}
            {error === "invalid" ? (
              <Alert
                variant="destructive"
                className={cn(
                  "border-red-200/80 bg-red-50 text-red-900",
                  "[&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-red-600",
                )}
              >
                <AlertCircle className="size-4" strokeWidth={2} aria-hidden />
                <AlertTitle className="text-red-950">Sign in failed</AlertTitle>
                <AlertDescription className="text-red-800/90">
                  Check your email and password, then try again.
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-ink-60">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@venue.com"
              />
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
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" size="lg" className="mt-1 w-full gap-2.5 shadow-card-sm">
              Continue to scanner
              <ArrowRight className="size-5 shrink-0" strokeWidth={2} aria-hidden />
            </Button>
            <p className="text-center text-xs leading-relaxed text-ink-40">
              Need credentials? Ask your event organizer — scanners cannot self-register.
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
