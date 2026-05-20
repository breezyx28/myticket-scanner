import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react"
import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ScanResultDetail } from "@/features/scan/types"
import { cn } from "@/lib/utils"

const DISMISS_MS = 3200

interface ScanResultSheetProps {
  result: ScanResultDetail | null
  loading?: boolean
  onDismiss: () => void
}

export function ScanResultSheet({ result, loading, onDismiss }: ScanResultSheetProps) {
  const open = Boolean(result) || Boolean(loading)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (loading || !result) return
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(result.kind === "success" ? [40, 30, 40] : 80)
    }
    timerRef.current = setTimeout(() => onDismiss(), DISMISS_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [loading, result, onDismiss])

  const liveMessage = loading
    ? "Validating ticket."
    : result
      ? summarize(result)
      : ""

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {liveMessage}
      </p>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) onDismiss()
        }}
      >
        <DialogContent
          showClose={Boolean(result && !loading)}
          className={cn(
            "gap-6 border-0 sm:max-w-md",
            result?.kind === "success" && "bg-lime text-ink",
            result?.kind === "failed" && "bg-coral text-white",
            result?.kind === "used" && "bg-amber text-ink",
            result?.kind === "expired" && "bg-ink-80 text-white",
            loading && "bg-ink-80 text-white",
          )}
        >
          {loading ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Checking ticket…
                </DialogTitle>
                <DialogDescription className="text-white/70">
                  Please wait while we validate this scan.
                </DialogDescription>
              </DialogHeader>
            </>
          ) : result ? (
            <>
              <DialogHeader className="gap-4 text-left">
                <div className="flex items-start gap-3">
                  {result.kind === "success" ? (
                    <CheckCircle2 className="size-10 shrink-0" strokeWidth={2} aria-hidden />
                  ) : null}
                  {result.kind === "failed" ? (
                    <XCircle className="size-10 shrink-0 opacity-95" strokeWidth={2} aria-hidden />
                  ) : null}
                  {result.kind === "used" ? (
                    <AlertTriangle className="size-10 shrink-0" strokeWidth={2} aria-hidden />
                  ) : null}
                  {result.kind === "expired" ? (
                    <Clock className="size-10 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                  ) : null}
                  <div className="min-w-0">
                    <DialogTitle className="text-2xl font-extrabold tracking-tight">
                      {titleFor(result)}
                    </DialogTitle>
                    <DialogDescription
                      className={cn(
                        "mt-2 text-base",
                        result.kind === "success" && "text-ink-80",
                        result.kind === "failed" && "text-white/90",
                        result.kind === "used" && "text-ink-80",
                        result.kind === "expired" && "text-ink-20",
                      )}
                    >
                      {bodyFor(result)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              {result.kind === "success" ? (
                <dl className="grid grid-cols-1 gap-3 rounded-2xl bg-black/10 p-4 font-mono text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-sans font-semibold uppercase opacity-70">Guest</dt>
                    <dd className="font-sans text-base font-bold">{result.holderName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-sans font-semibold uppercase opacity-70">Event</dt>
                    <dd className="font-sans text-base font-semibold">{result.eventName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-sans font-semibold uppercase opacity-70">Venue</dt>
                    <dd className="font-sans font-medium">{result.venue}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-sans font-semibold uppercase opacity-70">Seat</dt>
                    <dd className="text-lg font-bold tracking-tight">
                      Sec {result.section} · {result.seat}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-sans font-semibold uppercase opacity-70">Ticket type</dt>
                    <dd className="font-sans text-base font-semibold">{result.ticketType}</dd>
                  </div>
                </dl>
              ) : null}
              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button
                  type="button"
                  variant="dark"
                  size="lg"
                  className="w-full bg-ink text-white hover:bg-ink-80"
                  onClick={() => onDismiss()}
                >
                  Scan next
                </Button>
                <p className="text-center text-xs opacity-70">This dialog closes automatically.</p>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

function titleFor(r: ScanResultDetail): string {
  switch (r.kind) {
    case "success":
      return "Entry granted"
    case "failed":
      return "Entry denied"
    case "used":
      return "Already used"
    case "expired":
      return "Expired"
    default:
      return ""
  }
}

function bodyFor(r: ScanResultDetail): string {
  switch (r.kind) {
    case "success":
      return "Ticket is valid for this event."
    case "failed":
      return r.message
    case "used":
      return `${r.holderName} — this ticket was already scanned for ${r.eventName}.`
    case "expired":
      return r.message
    default:
      return ""
  }
}

function summarize(r: ScanResultDetail): string {
  if (r.kind === "success") return `Entry granted for ${r.holderName}.`
  if (r.kind === "failed") return `Entry denied. ${r.message}`
  if (r.kind === "used") return `Already used ticket for ${r.holderName}.`
  return r.message
}
