import { Html5Qrcode } from "html5-qrcode"
import { useCallback, useEffect, useId, useRef } from "react"
import { useTranslation } from "react-i18next"

import {
  disposeNativeScan,
  startNativeScan,
  stopNativeScan,
} from "@/platform/camera/nativeScan"
import { isNativePlatform } from "@/platform/detect"

interface ScannerViewfinderProps {
  active: boolean
  paused: boolean
  onDecoded: (text: string) => void
  onCameraError: (message: string | null) => void
}

const scanConfig = {
  fps: 8,
  qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
    const m = Math.min(viewfinderWidth, viewfinderHeight)
    const inset = Math.max(12, Math.min(40, m * 0.05))
    const side = Math.floor(Math.max(140, m - inset * 2))
    return {
      width: Math.min(side, viewfinderWidth - 8),
      height: Math.min(side, viewfinderHeight - 8),
    }
  },
}

function isCameraPermissionError(error: unknown): boolean {
  if (error instanceof DOMException) {
    return error.name === "NotAllowedError" || error.name === "PermissionDeniedError"
  }
  const msg = error instanceof Error ? error.message : String(error)
  return /NotAllowed|Permission|not allowed/i.test(msg)
}

export function ScannerViewfinder({
  active,
  paused,
  onDecoded,
  onCameraError,
}: ScannerViewfinderProps) {
  const { t } = useTranslation()
  const reactId = useId().replace(/:/g, "")
  const regionId = `qr-region-${reactId}`
  const instanceRef = useRef<Html5Qrcode | null>(null)
  const decodeCb = useRef(onDecoded)
  const pausedRef = useRef(paused)
  const activeRef = useRef(active)
  const onCameraErrorRef = useRef(onCameraError)

  useEffect(() => {
    decodeCb.current = onDecoded
  }, [onDecoded])

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    onCameraErrorRef.current = onCameraError
  }, [onCameraError])

  const cleanup = useCallback(async () => {
    const q = instanceRef.current
    instanceRef.current = null
    if (!q) return
    try {
      await q.stop()
    } catch {
      /* already stopped */
    }
    try {
      q.clear()
    } catch {
      /* */
    }
  }, [])

  useEffect(() => {
    if (isNativePlatform()) {
      void startNativeScan({
        active,
        paused,
        onDecoded,
        onCameraError,
        deniedMessage: t("scanner.camera.denied"),
        startFailedMessage: t("scanner.camera.startFailed"),
      })
      return () => {
        void stopNativeScan()
      }
    }

    let cancelled = false

    const start = async () => {
      await cleanup()
      if (cancelled || !active || paused) return
      onCameraErrorRef.current(null)
      const html5 = new Html5Qrcode(regionId, { verbose: false })
      instanceRef.current = html5
      const onOk = (text: string) => {
        if (!activeRef.current || pausedRef.current) return
        decodeCb.current(text)
      }
      const onFail = () => {
        /* frame had no QR — ignore */
      }
      try {
        await html5.start({ facingMode: "environment" }, scanConfig, onOk, onFail)
      } catch {
        if (cancelled) return
        try {
          await html5.start({ facingMode: "user" }, scanConfig, onOk, onFail)
        } catch (e) {
          if (cancelled) return
          if (isCameraPermissionError(e)) {
            onCameraErrorRef.current(t("scanner.camera.denied"))
          } else {
            onCameraErrorRef.current(t("scanner.camera.startFailed"))
          }
        }
      }
    }

    void start()

    return () => {
      cancelled = true
      void cleanup()
    }
  }, [active, cleanup, onCameraError, onDecoded, paused, regionId, t])

  useEffect(() => {
    return () => {
      if (isNativePlatform()) {
        void disposeNativeScan()
      }
    }
  }, [])

  return (
    <div
      className={
        isNativePlatform()
          ? "barcode-scanner-viewfinder relative h-full min-h-0 w-full bg-transparent"
          : "relative h-full min-h-0 w-full bg-black"
      }
    >
      <div
        id={regionId}
        className={
          isNativePlatform()
            ? "absolute inset-0 bg-transparent"
            : "absolute inset-0 overflow-hidden [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
        }
        aria-label={t("scanner.camera.viewfinderAria")}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-3 sm:p-6 md:p-10">
        <div
          className="aspect-square w-[min(82vmin,28rem)] max-h-[min(82vmin,calc(100%-1rem))] max-w-[calc(100%-1rem)] rounded-[1.25rem] border-2 border-white/55 shadow-[0_0_0_9999px_rgba(0,0,0,0.38)] sm:rounded-3xl sm:border-white/45"
          aria-hidden
        />
      </div>
      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-4 pt-16 pb-[max(1rem,env(safe-area-inset-bottom))] text-center sm:pt-20"
        aria-hidden
      >
        <p className="text-[13px] font-medium text-white/90 sm:text-sm">
          {t("scanner.camera.alignQr")}
        </p>
        <p className="mt-1 text-[11px] text-white/55 sm:text-xs">
          {t("scanner.camera.oneScanHint")}
        </p>
      </div>
      <p className="sr-only" aria-live="polite">
        {!active
          ? t("scanner.camera.srOff")
          : paused
            ? t("scanner.camera.srPaused")
            : t("scanner.camera.srActive")}
      </p>
    </div>
  )
}
