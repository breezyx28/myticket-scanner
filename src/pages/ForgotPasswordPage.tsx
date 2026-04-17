import { useState } from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/layouts/AuthLayout"

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <AuthLayout>
      <Card className="border-ink-10 shadow-card-lg">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>
            Mock flow — no email is sent. After submitting, use the demo reset link below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-ink-60 leading-relaxed">
                If an account exists for <span className="font-semibold text-ink">{email}</span>,
                we would email a reset link. In this demo, open the link below to choose a new
                password (UI only — sign-in still uses demo passwords from the README).
              </p>
              <Button asChild variant="secondary" className="w-full">
                <Link to="/reset-password?token=demo">Open demo reset link</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link to="/login">Back to sign in</Link>
              </Button>
            </div>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="fp-email">Email</Label>
                <Input
                  id="fp-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="w-full">
                Send reset link
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link to="/login">Cancel</Link>
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
