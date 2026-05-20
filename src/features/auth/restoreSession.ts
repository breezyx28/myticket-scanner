import type { AppDispatch } from "@/app/store"
import { scannerApi } from "@/features/scanner/scannerApi"
import { parseApiError } from "@/shared/lib/parseApiError"

import {
  clearAuth,
  setAssignments,
  setBootstrapLoading,
  setDeviceId,
} from "./authSlice"

function defaultDeviceLabel(): string {
  const platform =
    typeof navigator !== "undefined" && "platform" in navigator
      ? navigator.platform
      : "Web"
  return `Scanner ${platform}`.slice(0, 160)
}

export async function restoreScannerSession(dispatch: AppDispatch): Promise<void> {
  dispatch(setBootstrapLoading())
  try {
    const me = await dispatch(
      scannerApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
    ).unwrap()

    let deviceId = me.devices?.find((d) => d.is_active !== false)?.id

    if (!deviceId) {
      const device = await dispatch(
        scannerApi.endpoints.registerDevice.initiate({
          device_label: defaultDeviceLabel(),
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        }),
      ).unwrap()
      deviceId = device.id
    }

    dispatch(setDeviceId(deviceId))

    const assignments = await dispatch(
      scannerApi.endpoints.getAssignments.initiate(undefined, { forceRefetch: true }),
    ).unwrap()

    dispatch(setAssignments(assignments))
  } catch (error) {
    const parsed = parseApiError(error)
    console.warn("[auth] Session restore failed:", parsed.message)
    dispatch(clearAuth())
  }
}
