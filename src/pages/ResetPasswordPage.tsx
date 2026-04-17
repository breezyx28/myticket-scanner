import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/layouts/AuthLayout"

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get("token")
  const [pw, setPw] = useState("")
  const [pw2, setPw2] = useState("")

  const validToken = token === "demo"

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw.length < 6) {
      toast.error("Use at least 6 characters for this demo.")
      return
    }
    if (pw !== pw2) {
      toast.error("Passwords do not match.")
      return
    }
    toast.success("Password updated (demo only — scanner login still uses README credentials).")
    navigate("/login", { replace: true })
  }

  if (!validToken) {
    return (
      <AuthLayout>
        <Card className="border-ink-10 shadow-card-lg">
          <CardHeader>
            <CardTitle>Invalid or expired link</CardTitle>
            <CardDescription>Use the demo link from the forgot-password screen.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/forgot-password">Request again</Link>
            </Button>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Card className="border-ink-10 shadow-card-lg">
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>Demo reset — does not change mock account passwords.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="np">New password</Label>
              <Input
                id="np"
                type="password"
                autoComplete="new-password"
                required
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="np2">Confirm password</Label>
              <Input
                id="np2"
                type="password"
                autoComplete="new-password"
                required
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="w-full">
              Save password
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/login">Back to sign in</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
