import { Camera, CameraOff } from "lucide-react"
import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"

import { useAppSelector } from "@/app/hooks"
import { EventPicker } from "@/components/scanner/EventPicker"
import { ManualEntryDialog } from "@/components/scanner/ManualEntryDialog"
import { RealtimeConnectionBadge } from "@/components/scanner/RealtimeConnectionBadge"
import { ScanResultSheet } from "@/components/scanner/ScanResultSheet"
import { ScannerViewfinder } from "@/components/scanner/ScannerViewfinder"
import { Button } from "@/components/ui/button"
import {
  selectDeviceId,
  selectSelectedAssignment,
  selectSelectedEventId,
} from "@/features/auth/authSlice"
import { useCreateScanMutation } from "@/features/scanner/scannerApi"
import { formatRemoteScanToast } from "@/features/realtime/formatRemoteScanToast"
import { useScannerScanRealtime } from "@/features/realtime/useScannerScanRealtime"
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
  const [cameraOn, setCameraOn] = useState(true)

  const { connectionState } = useScannerScanRealtime({
    onRemoteScan: (row) => {
      toast.message(formatRemoteScanToast(row), { duration: 4500 })
    },
  })

  /** Held from first decode until result sheet is dismissed — prevents repeat API calls. */
  const scanSessionLocked = useRef(false)

  const scannerPaused = loading || Boolean(result)
  const viewfinderActive = cameraOn && !camError

  const handlePayload = useCallback(
    async (raw: string) => {
      if (scanSessionLocked.current) return

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

      scanSessionLocked.current = true
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
      }
    },
    [assignment, createScan, deviceId, selectedEventId],
  )

  const dismiss = useCallback(() => {
    setResult(null)
    setLoading(false)
    scanSessionLocked.current = false
  }, [])

  const toggleCamera = useCallback(() => {
    setCameraOn((on) => {
      const next = !on
      if (!next) setCamError(null)
      return next
    })
  }, [])

  const toolButtonClass =
    "border-white/25 bg-white/10 text-white hover:bg-white/18 min-h-[44px] px-3 text-xs font-semibold sm:px-4 sm:text-sm"

  const toolbarActions = (
    <>
      <Button
        type="button"
        variant="outline"
        className={cn(toolButtonClass, "gap-2")}
        onClick={toggleCamera}
        aria-pressed={cameraOn}
        aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
      >
        {cameraOn ? (
          <>
            <CameraOff className="size-4 shrink-0" strokeWidth={2} aria-hidden />
            <span className="hidden sm:inline">Camera off</span>
          </>
        ) : (
          <>
            <Camera className="size-4 shrink-0" strokeWidth={2} aria-hidden />
            <span className="hidden sm:inline">Camera on</span>
          </>
        )}
      </Button>
      <ManualEntryDialog onSubmitPayload={handlePayload} triggerClassName={toolButtonClass} />
    </>
  )

  return (
    <ScannerLayout
      toolbar={
        <div className="flex min-w-0 items-center gap-2">
          <RealtimeConnectionBadge state={connectionState} className="hidden sm:inline-flex" />
          <div className="flex min-w-0 max-w-[min(100%,12.5rem)] items-center sm:max-w-[240px]">
            <EventPicker />
          </div>
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
              {toolbarActions}
              <Button
                type="button"
                variant="outline"
                className="min-h-[44px] border-ink/20 bg-white text-ink hover:bg-ink-5"
                onClick={() => {
                  setCamError(null)
                  setCameraOn(true)
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
              "flex shrink-0 flex-wrap items-center justify-end gap-2 border-b border-white/10 px-3 py-2",
              "sm:px-4",
            )}
          >
            {toolbarActions}
          </div>
        )}

        <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
          {viewfinderActive ? (
            <div className="absolute inset-0 min-h-0">
              <ScannerViewfinder
                active={viewfinderActive}
                paused={scannerPaused}
                onDecoded={handlePayload}
                onCameraError={setCamError}
              />
            </div>
          ) : (
            <div className="flex h-full min-h-[min(50dvh,360px)] flex-col items-center justify-center gap-5 px-6 py-10 text-center">
              {camError ? null : (
                <>
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-white/10">
                    <CameraOff className="size-8 text-white/70" strokeWidth={1.75} aria-hidden />
                  </div>
                  <div className="max-w-sm space-y-2">
                    <p className="text-base font-semibold text-white">Camera is off</p>
                    <p className="text-sm leading-relaxed text-white/60">
                      Turn the camera back on to scan QR codes, or use manual entry for ticket codes.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(toolButtonClass, "gap-2")}
                    onClick={() => setCameraOn(true)}
                  >
                    <Camera className="size-4" strokeWidth={2} aria-hidden />
                    Turn camera on
                  </Button>
                </>
              )}
              {camError ? (
                <p className="max-w-sm text-sm leading-relaxed text-white/65">
                  Fix camera permissions above, or enter a ticket code manually.
                </p>
              ) : null}
              <ManualEntryDialog
                onSubmitPayload={handlePayload}
                triggerClassName={cn(toolButtonClass, "gap-2")}
              />
            </div>
          )}
        </div>
      </div>

      <ScanResultSheet result={result} loading={loading} onDismiss={dismiss} />
    </ScannerLayout>
  )
}
