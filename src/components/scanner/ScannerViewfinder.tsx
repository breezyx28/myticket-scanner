import { Html5Qrcode } from "html5-qrcode"
import { useCallback, useEffect, useId, useRef } from "react"

interface ScannerViewfinderProps {
  paused: boolean
  onDecoded: (text: string) => void
  onCameraError: (message: string | null) => void
}

const scanConfig = {
  fps: 10,
  qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
    const m = Math.min(viewfinderWidth, viewfinderHeight)
    const inset = Math.max(12, Math.min(40, m * 0.05))
    const side = Math.floor(Math.max(140, m - inset * 2))
    return { width: Math.min(side, viewfinderWidth - 8), height: Math.min(side, viewfinderHeight - 8) }
  },
}

export function ScannerViewfinder({ paused, onDecoded, onCameraError }: ScannerViewfinderProps) {
  const reactId = useId().replace(/:/g, "")
  const regionId = `qr-region-${reactId}`
  const instanceRef = useRef<Html5Qrcode | null>(null)
  const decodeCb = useRef(onDecoded)
  useEffect(() => {
    decodeCb.current = onDecoded
  }, [onDecoded])

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
    let cancelled = false

    const start = async () => {
      await cleanup()
      if (cancelled || paused) return
      onCameraError(null)
      const html5 = new Html5Qrcode(regionId, { verbose: false })
      instanceRef.current = html5
      const onOk = (text: string) => {
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
          const msg = e instanceof Error ? e.message : String(e)
          if (/NotAllowed|Permission|not allowed/i.test(msg)) {
            onCameraError("Camera access was denied. Use Simulate scan or Manual entry.")
          } else {
            onCameraError("Could not start the camera on this device.")
          }
        }
      }
    }

    void start()

    return () => {
      cancelled = true
      void cleanup()
    }
  }, [cleanup, onCameraError, paused, regionId])

  return (
    <div className="relative h-full min-h-0 w-full bg-black">
      <div
        id={regionId}
        className="absolute inset-0 overflow-hidden [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
        aria-label="Camera viewfinder for QR scanning"
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
          Align the QR code within the frame
        </p>
        <p className="mt-1 text-[11px] text-white/55 sm:text-xs">Hold steady for a clear scan</p>
      </div>
      <p className="sr-only" aria-live="polite">
        {paused ? "Camera paused while showing a scan result." : "Camera active. Point at a ticket QR code."}
      </p>
    </div>
  )
}
