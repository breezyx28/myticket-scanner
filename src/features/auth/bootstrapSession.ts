import type { AppDispatch } from "@/app/store"
import { scannerApi } from "@/features/scanner/scannerApi"
import { defaultDeviceLabel } from "@/features/auth/deviceLabel"
import i18n from "@/i18n/config"
import { parseApiError } from "@/shared/lib/parseApiError"
import type { LoginResponse, LoginSuccess } from "@/shared/schemas/auth"
import { isLoginSuccess } from "@/shared/schemas/authGuards"

import {
  clearAuth,
  setAssignments,
  setBootstrapLoading,
  setCredentials,
  setDeviceId,
  setScannerAccountId,
} from "./authSlice"

export async function bootstrapScannerSession(
  dispatch: AppDispatch,
  loginResult: LoginSuccess,
): Promise<
  | { ok: true }
  | { ok: false; message: string; accessDenied?: boolean }
> {
  dispatch(setBootstrapLoading())
  dispatch(setCredentials({ token: loginResult.token, user: loginResult.user }))

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

    return { ok: true }
  } catch (error) {
    const parsed = parseApiError(error)
    dispatch(clearAuth())
    return {
      ok: false,
      message: parsed.message,
      accessDenied: parsed.status === 403,
    }
  }
}

export function handleLoginResponse(
  dispatch: AppDispatch,
  response: LoginResponse,
): Promise<
  | { ok: true }
  | { ok: false; message: string; twoFactor?: boolean; accessDenied?: boolean }
> {
  if (!isLoginSuccess(response)) {
    return Promise.resolve({
      ok: false,
      message: i18n.t("auth.twoFactorRequired"),
      twoFactor: true,
    })
  }
  return bootstrapScannerSession(dispatch, response)
}
