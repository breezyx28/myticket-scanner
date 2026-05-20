import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"

import { useAppSelector } from "@/app/hooks"
import { EventPicker } from "@/components/scanner/EventPicker"
import { ManualEntryDialog } from "@/components/scanner/ManualEntryDialog"
import { ScanResultSheet } from "@/components/scanner/ScanResultSheet"
import { ScannerViewfinder } from "@/components/scanner/ScannerViewfinder"
import { SimulateScanDialog } from "@/components/scanner/SimulateScanDialog"
import { Button } from "@/components/ui/button"
import {
  selectDeviceId,
  selectSelectedAssignment,
  selectSelectedEventId,
} from "@/features/auth/authSlice"
import { useCreateScanMutation } from "@/features/scanner/scannerApi"
import { mapScanLogToResult } from "@/features/scan/mapScanResult"
import { parseTicketCode } from "@/features/scan/parseTicketCode"
import type { ScanResultDetail } from "@/features/scan/types"
import { ScannerLayout } from "@/layouts/ScannerLayout"
import { parseApiError } from "@/shared/lib/parseApiError"
import { cn } from "@/lib/utils"

export function ScannerPage() {
  const selectedEventId = useAppSelector(selectSelectedEventId)
  const deviceId = useAppSelector(selectDeviceId)
  const assignment = useAppSelector(selectSelectedAssignment)
  const [createScan] = useCreateScanMutation()

  const [result, setResult] = useState<ScanResultDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [camError, setCamError] = useState<string | null>(null)
  const busy = useRef(false)
  const lastRaw = useRef<string>("")
  const lastAt = useRef(0)

  const paused = loading || Boolean(result)

  const handlePayload = useCallback(
    async (raw: string) => {
      if (selectedEventId == null) {
        toast.error("Select an event first.")
        return
      }
      if (deviceId == null) {
        toast.error("Device not registered. Sign in again.")
        return
      }

      const parsed = parseTicketCode(raw)
      if (!parsed.ticketCode) {
        toast.error("Invalid QR — no ticket code found.")
        return
      }

      if (parsed.eventId != null && parsed.eventId !== selectedEventId) {
        toast.error("This ticket is for a different event.")
        return
      }

      const now = Date.now()
      if (raw === lastRaw.current && now - lastAt.current < 1800) return
      lastRaw.current = raw
      lastAt.current = now
      if (busy.current) return

      busy.current = true
      setLoading(true)
      setResult(null)

      try {
        const log = await createScan({
          event_id: selectedEventId,
          ticket_code: parsed.ticketCode,
          device_id: deviceId,
          signature: parsed.signature,
        }).unwrap()

        setResult(mapScanLogToResult(log, assignment))
      } catch (error) {
        const apiErr = parseApiError(error)
        setResult({
          kind: "failed",
          message: apiErr.message,
        })
      } finally {
        setLoading(false)
        busy.current = false
      }
    },
    [assignment, createScan, deviceId, selectedEventId],
  )

  const dismiss = useCallback(() => {
    setResult(null)
    setLoading(false)
    busy.current = false
  }, [])

  const toolButtonClass =
    "border-white/25 bg-white/10 text-white hover:bg-white/18 min-h-[44px] px-3 text-xs font-semibold sm:px-4 sm:text-sm"

  return (
    <ScannerLayout
      toolbar={
        <div className="flex min-w-0 max-w-[min(100%,12.5rem)] items-center sm:max-w-[240px]">
          <EventPicker />
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {camError ? (
          <div
            className="flex shrink-0 flex-col gap-3 border-b border-amber-400/30 bg-amber-500/15 px-4 py-3 text-ink sm:flex-row sm:items-center sm:justify-between"
            role="status"
          >
            <p className="min-w-0 text-sm font-medium leading-snug text-ink">{camError}</p>
            <div className="flex flex-wrap gap-2">
              <SimulateScanDialog onSubmitPayload={handlePayload} triggerClassName={toolButtonClass} />
              <ManualEntryDialog onSubmitPayload={handlePayload} triggerClassName={toolButtonClass} />
              <Button
                type="button"
                variant="outline"
                className="min-h-[44px] border-ink/20 bg-white text-ink hover:bg-ink-5"
                onClick={() => {
                  setCamError(null)
                  toast.message("Retrying camera…")
                }}
              >
                Retry camera
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "flex shrink-0 items-center justify-end gap-2 border-b border-white/10 px-3 py-2",
              "sm:px-4",
            )}
          >
            <SimulateScanDialog onSubmitPayload={handlePayload} triggerClassName={toolButtonClass} />
            <ManualEntryDialog onSubmitPayload={handlePayload} triggerClassName={toolButtonClass} />
          </div>
        )}

        <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
          {!camError ? (
            <div className="absolute inset-0 min-h-0">
              <ScannerViewfinder paused={paused} onDecoded={handlePayload} onCameraError={setCamError} />
            </div>
          ) : (
            <div className="flex h-full min-h-[min(50dvh,360px)] flex-col items-center justify-center gap-4 px-6 py-10 text-center">
              <p className="max-w-sm text-sm leading-relaxed text-white/65">
                The viewfinder stays off while the camera cannot start. Use simulate or manual entry,
                or retry after fixing browser permissions.
              </p>
            </div>
          )}
        </div>
      </div>

      <ScanResultSheet result={result} loading={loading} onDismiss={dismiss} />
    </ScannerLayout>
  )
}
