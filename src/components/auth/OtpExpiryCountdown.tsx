import { Clock } from "lucide-react"
import { useEffect, useState } from "react"

import { OTP_EXPIRES_MINUTES } from "@/shared/schemas/passwordReset"
import { cn } from "@/lib/utils"

interface OtpExpiryCountdownProps {
  sentAt: number
  className?: string
}

function formatRemaining(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, "0")}`
}

export function OtpExpiryCountdown({ sentAt, className }: OtpExpiryCountdownProps) {
  const expiresAt = sentAt + OTP_EXPIRES_MINUTES * 60 * 1000
  const [remainingMs, setRemainingMs] = useState(() => expiresAt - Date.now())

  useEffect(() => {
    const tick = () => setRemainingMs(expiresAt - Date.now())
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [expiresAt])

  const expired = remainingMs <= 0

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-sm",
        expired
          ? "border-amber-200/90 bg-amber-50 text-amber-950"
          : "border-ink-10 bg-ink-5 text-ink-60",
        className,
      )}
      role="status"
    >
      <Clock className="size-4 shrink-0" strokeWidth={2} aria-hidden />
      {expired ? (
        <span>Code expired — request a new one below.</span>
      ) : (
        <span>
          Code expires in{" "}
          <span className="font-mono font-semibold tabular-nums text-ink">
            {formatRemaining(remainingMs)}
          </span>
        </span>
      )}
    </div>
  )
}
