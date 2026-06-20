import type { AppDispatch } from "@/app/store"
import { defaultDeviceLabel } from "@/features/auth/deviceLabel"
import { scannerApi } from "@/features/scanner/scannerApi"
import { parseApiError } from "@/shared/lib/parseApiError"

import { clearAuthSession } from "./clearAuthSession"
import {
  setAssignments,
  setBootstrapLoading,
  setDeviceId,
  setScannerAccountId,
} from "./authSlice"

export async function restoreScannerSession(dispatch: AppDispatch): Promise<void> {
  dispatch(setBootstrapLoading())
  try {
    const me = await dispatch(
      scannerApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
    ).unwrap()

    dispatch(setScannerAccountId(me.id))

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
    await clearAuthSession(dispatch)
  }
}
