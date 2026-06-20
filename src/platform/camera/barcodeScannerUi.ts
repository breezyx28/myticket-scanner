import { isNativePlatform } from "@/platform/detect"

const ACTIVE_CLASS = "barcode-scanner-active"

export function setBarcodeScannerUiActive(active: boolean): void {
  if (!isNativePlatform()) return
  document.documentElement.classList.toggle(ACTIVE_CLASS, active)
  document.body.classList.toggle(ACTIVE_CLASS, active)
}
