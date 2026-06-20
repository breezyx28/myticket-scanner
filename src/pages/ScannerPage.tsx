import { Camera, CameraOff } from "lucide-react"
import { KeepAwake } from "@capacitor-community/keep-awake"
import { App as CapacitorApp } from "@capacitor/app"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { useAppSelector } from "@/app/hooks"
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher"
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
import { isNativePlatform } from "@/platform/detect"
import { registerNativeBackHandler } from "@/platform/nativeBootstrap"
import { showForegroundScanNotification } from "@/platform/notifications"
import { parseApiError } from "@/shared/lib/parseApiError"
import { cn } from "@/lib/utils"

export function ScannerPage() {
  const { t } = useTranslation()
  const selectedEventId = useAppSelector(selectSelectedEventId)
  const deviceId = useAppSelector(selectDeviceId)
  const assignment = useAppSelector(selectSelectedAssignment)
  const [createScan] = useCreateScanMutation()

  const [result, setResult] = useState<ScanResultDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [camError, setCamError] = useState<string | null>(null)
  const [cameraOn, setCameraOn] = useState(true)

  const scanSessionLocked = useRef(false)
  const scannerPaused = loading || Boolean(result)
  const viewfinderActive = cameraOn && !camError

  const { connectionState } = useScannerScanRealtime({
    onRemoteScan: (row) => {
      const message = formatRemoteScanToast(row, t)
      toast.message(message, { duration: 4500 })
      void showForegroundScanNotification(t("common.appName"), message)
    },
  })

  useEffect(() => {
    if (!isNativePlatform()) return
    return registerNativeBackHandler(() => {
      void CapacitorApp.minimizeApp()
    })
  }, [])

  useEffect(() => {
    if (!isNativePlatform()) return
    void (async () => {
      if (viewfinderActive && !scannerPaused) {
        await KeepAwake.keepAwake()
      } else {
        await KeepAwake.allowSleep()
      }
    })()
    return () => {
      void KeepAwake.allowSleep()
    }
  }, [scannerPaused, viewfinderActive])

  const handlePayload = useCallback(
    async (raw: string) => {
      if (scanSessionLocked.current) return

      if (selectedEventId == null) {
        toast.error(t("scanner.toasts.selectEvent"))
        return
      }
      if (deviceId == null) {
        toast.error(t("scanner.toasts.deviceNotRegistered"))
        return
      }

      const parsed = parseTicketCode(raw)
      if (!parsed.ticketCode) {
        toast.error(t("scanner.toasts.invalidQr"))
        return
      }

      if (parsed.eventId != null && parsed.eventId !== selectedEventId) {
        toast.error(t("scanner.toasts.wrongEvent"))
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

        setResult(mapScanLogToResult(log, assignment, t))
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
    [assignment, createScan, deviceId, selectedEventId, t],
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
        aria-label={cameraOn ? t("scanner.camera.offAria") : t("scanner.camera.onAria")}
      >
        {cameraOn ? (
          <>
            <CameraOff className="size-4 shrink-0" strokeWidth={2} aria-hidden />
            <span className="hidden sm:inline">{t("scanner.camera.off")}</span>
          </>
        ) : (
          <>
            <Camera className="size-4 shrink-0" strokeWidth={2} aria-hidden />
            <span className="hidden sm:inline">{t("scanner.camera.on")}</span>
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
          <LanguageSwitcher variant="dark" className="hidden sm:inline-flex" />
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
                  toast.message(t("scanner.camera.retrying"))
                }}
              >
                {t("scanner.camera.retry")}
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
            <LanguageSwitcher variant="dark" className="sm:hidden" />
            {toolbarActions}
          </div>
        )}

        <div
          className={cn(
            "relative min-h-0 flex-1 overflow-hidden",
            isNativePlatform() && viewfinderActive ? "bg-transparent" : "bg-black",
          )}
        >
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
                    <p className="text-base font-semibold text-white">{t("scanner.camera.isOff")}</p>
                    <p className="text-sm leading-relaxed text-white/60">
                      {t("scanner.camera.isOffDescription")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(toolButtonClass, "gap-2")}
                    onClick={() => setCameraOn(true)}
                  >
                    <Camera className="size-4" strokeWidth={2} aria-hidden />
                    {t("scanner.camera.turnOn")}
                  </Button>
                </>
              )}
              {camError ? (
                <p className="max-w-sm text-sm leading-relaxed text-white/65">
                  {t("scanner.camera.fixPermissions")}
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
