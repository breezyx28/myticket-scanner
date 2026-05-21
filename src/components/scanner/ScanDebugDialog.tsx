import { Check, Copy } from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ParsedTicketCode } from "@/features/scan/parseTicketCode"

export type ScanDebugErrorKind =
  | "parse"
  | "wrong_event"
  | "precheck"
  | "api"
  | "scan_result_failed"

export interface ScanDebugPayload {
  raw: string
  parsed: ParsedTicketCode
  errorKind: ScanDebugErrorKind
  errorMessage: string
  scannedAt: string
  selectedEventId: number | null
  deviceId: number | null
  apiResult?: string
}

function buildReport(payload: ScanDebugPayload): string {
  return JSON.stringify(
    {
      scannedAt: payload.scannedAt,
      errorKind: payload.errorKind,
      errorMessage: payload.errorMessage,
      selectedEventId: payload.selectedEventId,
      deviceId: payload.deviceId,
      raw: payload.raw,
      parsed: payload.parsed,
      apiResult: payload.apiResult,
    },
    null,
    2,
  )
}

interface ScanDebugDialogProps {
  payload: ScanDebugPayload | null
  onClose: () => void
}

export function ScanDebugDialog({ payload, onClose }: ScanDebugDialogProps) {
  const [copied, setCopied] = useState<"all" | "raw" | null>(null)

  const copyText = useCallback(async (text: string, label: "all" | "raw") => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      toast.success(label === "all" ? "Debug report copied" : "Raw QR copied")
      window.setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error("Could not copy — check browser permissions")
    }
  }, [])

  const report = payload ? buildReport(payload) : ""

  return (
    <Dialog open={Boolean(payload)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-ink-10 px-5 py-4 text-left">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700">
            Test / debug
          </p>
          <DialogTitle className="text-lg">Scan debug report</DialogTitle>
          <DialogDescription className="text-sm text-ink-60">
            Copy this payload and send it to your developer when a scan fails.
          </DialogDescription>
        </DialogHeader>

        {payload ? (
          <div className="max-h-[50dvh] space-y-4 overflow-y-auto px-5 py-4">
            <div className="rounded-xl border border-red-200/80 bg-red-50 px-3 py-2.5 text-sm text-red-900">
              <span className="font-semibold capitalize">{payload.errorKind.replace("_", " ")}</span>
              {" — "}
              {payload.errorMessage}
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-40">Raw QR value</p>
              <pre className="max-h-28 overflow-auto rounded-xl border border-ink-10 bg-ink-5 p-3 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap text-ink">
                {payload.raw || "(empty)"}
              </pre>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-40">Parsed</p>
              <pre className="max-h-32 overflow-auto rounded-xl border border-ink-10 bg-ink-5 p-3 font-mono text-xs leading-relaxed text-ink">
                {JSON.stringify(payload.parsed, null, 2)}
              </pre>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-ink-60">
              <p>
                <span className="font-semibold text-ink-80">Event id:</span>{" "}
                {payload.selectedEventId ?? "—"}
              </p>
              <p>
                <span className="font-semibold text-ink-80">Device id:</span>{" "}
                {payload.deviceId ?? "—"}
              </p>
              <p className="col-span-2">
                <span className="font-semibold text-ink-80">Time:</span> {payload.scannedAt}
              </p>
            </div>
          </div>
        ) : null}

        <DialogFooter className="flex-col gap-2 border-t border-ink-10 px-5 py-4 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 sm:flex-1"
            disabled={!payload}
            onClick={() => payload && void copyText(payload.raw, "raw")}
          >
            {copied === "raw" ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <Copy className="size-4" aria-hidden />
            )}
            Copy raw
          </Button>
          <Button
            type="button"
            className="w-full gap-2 sm:flex-1"
            disabled={!payload}
            onClick={() => payload && void copyText(report, "all")}
          >
            {copied === "all" ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <Copy className="size-4" aria-hidden />
            )}
            Copy full report
          </Button>
          <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
