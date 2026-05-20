import type { AppDispatch } from "@/app/store"
import { scannerApi } from "@/features/scanner/scannerApi"
import { parseApiError } from "@/shared/lib/parseApiError"
import type { LoginResponse, LoginSuccess } from "@/shared/schemas/auth"
import { isLoginSuccess } from "@/shared/schemas/authGuards"

import {
  clearAuth,
  setAssignments,
  setBootstrapLoading,
  setCredentials,
  setDeviceId,
} from "./authSlice"

function defaultDeviceLabel(): string {
  const platform =
    typeof navigator !== "undefined" && "platform" in navigator
      ? navigator.platform
      : "Web"
  return `Scanner ${platform}`.slice(0, 160)
}

export async function bootstrapScannerSession(
  dispatch: AppDispatch,
  loginResult: LoginSuccess,
): Promise<{ ok: true } | { ok: false; message: string }> {
  dispatch(setBootstrapLoading())
  dispatch(setCredentials({ token: loginResult.token, user: loginResult.user }))

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

    return { ok: true }
  } catch (error) {
    const parsed = parseApiError(error)
    dispatch(clearAuth())
    return { ok: false, message: parsed.message }
  }
}

export function handleLoginResponse(
  dispatch: AppDispatch,
  response: LoginResponse,
): Promise<{ ok: true } | { ok: false; message: string; twoFactor?: boolean }> {
  if (!isLoginSuccess(response)) {
    return Promise.resolve({
      ok: false,
      message: "Two-factor authentication is required. This app does not support 2FA yet.",
      twoFactor: true,
    })
  }
  return bootstrapScannerSession(dispatch, response)
}
