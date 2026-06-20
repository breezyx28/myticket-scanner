import type { PluginListenerHandle } from "@capacitor/core"
import {
  BarcodeFormat,
  BarcodeScanner,
  LensFacing,
} from "@capacitor-mlkit/barcode-scanning"

import { setBarcodeScannerUiActive } from "@/platform/camera/barcodeScannerUi"
import { isNativePlatform } from "@/platform/detect"

export interface ScanProviderOptions {
  active: boolean
  paused: boolean
  onDecoded: (text: string) => void
  onCameraError: (message: string | null) => void
  deniedMessage: string
  startFailedMessage: string
}

let listenerHandle: PluginListenerHandle | null = null
let errorListenerHandle: PluginListenerHandle | null = null
let lastDecoded = ""
let lastDecodedAt = 0
let scanSessionActive = false

const DEBOUNCE_MS = 1200

function isPermissionError(message: string): boolean {
  return /permission|not allowed|denied/i.test(message)
}

export async function startNativeScan(options: ScanProviderOptions): Promise<void> {
  if (!isNativePlatform()) return

  const { active, paused, onDecoded, onCameraError, deniedMessage, startFailedMessage } =
    options

  if (!active || paused) {
    await stopNativeScan()
    return
  }

  try {
    const supported = await BarcodeScanner.isSupported()
    if (!supported.supported) {
      onCameraError(startFailedMessage)
      return
    }

    const permissions = await BarcodeScanner.checkPermissions()
    if (permissions.camera !== "granted") {
      const requested = await BarcodeScanner.requestPermissions()
      if (requested.camera !== "granted") {
        onCameraError(deniedMessage)
        return
      }
    }

    onCameraError(null)
    setBarcodeScannerUiActive(true)
    scanSessionActive = true

    if (!listenerHandle) {
      listenerHandle = await BarcodeScanner.addListener("barcodesScanned", (event) => {
        const value = event.barcodes[0]?.rawValue ?? event.barcodes[0]?.displayValue
        if (!value) return
        const now = Date.now()
        if (value === lastDecoded && now - lastDecodedAt < DEBOUNCE_MS) return
        lastDecoded = value
        lastDecodedAt = now
        onDecoded(value)
      })
    }

    if (!errorListenerHandle) {
      errorListenerHandle = await BarcodeScanner.addListener("scanError", (event) => {
        onCameraError(event.message || startFailedMessage)
      })
    }

    await BarcodeScanner.startScan({
      formats: [BarcodeFormat.QrCode],
      lensFacing: LensFacing.Back,
    })
  } catch (error) {
    setBarcodeScannerUiActive(false)
    scanSessionActive = false
    const message = error instanceof Error ? error.message : String(error)
    onCameraError(isPermissionError(message) ? deniedMessage : startFailedMessage)
  }
}

export async function stopNativeScan(): Promise<void> {
  if (!isNativePlatform()) return

  if (scanSessionActive) {
    setBarcodeScannerUiActive(false)
    scanSessionActive = false
  }

  try {
    await BarcodeScanner.stopScan()
  } catch {
    /* already stopped */
  }
}

export async function disposeNativeScan(): Promise<void> {
  await stopNativeScan()
  if (listenerHandle) {
    await listenerHandle.remove()
    listenerHandle = null
  }
  if (errorListenerHandle) {
    await errorListenerHandle.remove()
    errorListenerHandle = null
  }
  lastDecoded = ""
  lastDecodedAt = 0
}
