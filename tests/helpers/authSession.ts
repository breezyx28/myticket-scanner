import { isLoginSuccess } from "@/shared/schemas/authGuards"
import { loginResponseSchema } from "@/shared/schemas/auth"
import {
  assignmentsResponseSchema,
  deviceRegisterRequestSchema,
  deviceResponseSchema,
  meResponseSchema,
  type Assignment,
  type ScannerAccount,
  type ScannerDevice,
} from "@/shared/schemas/scanner"

import { apiRequest } from "./apiClient"
import { assertSchema } from "./assertSchema"
import { getOptionalEventId, requireCredentials } from "./env"

export interface BootstrapResult {
  token: string
  me: ScannerAccount
  assignments: Assignment[]
  device: ScannerDevice
  deviceId: number
  eventId: number
}

export async function login(): Promise<{ token: string; userId: number }> {
  const { email, password } = requireCredentials()
  const res = await apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
  })

  if (res.status !== 200) {
    throw new Error(`Login failed (${res.status}): ${JSON.stringify(res.body)}`)
  }

  const parsed = assertSchema(loginResponseSchema, res.body, "login")
  if (!isLoginSuccess(parsed)) {
    throw new Error("Login returned 2FA challenge — set TEST_SCANNER_OTP support or use a non-2FA account")
  }

  return { token: parsed.token, userId: parsed.user.id }
}

export async function bootstrapScanner(token?: string): Promise<BootstrapResult> {
  const session = token ? { token, userId: 0 } : await login()
  const authToken = token ?? session.token

  const meRes = await apiRequest("/me", { token: authToken })
  if (meRes.status !== 200) {
    throw new Error(`GET /me failed (${meRes.status}): ${JSON.stringify(meRes.body)}`)
  }
  const me = assertSchema(meResponseSchema, meRes.body, "me").data

  const assignmentsRes = await apiRequest("/assignments", { token: authToken })
  if (assignmentsRes.status !== 200) {
    throw new Error(
      `GET /assignments failed (${assignmentsRes.status}): ${JSON.stringify(assignmentsRes.body)}`,
    )
  }
  const assignments = assertSchema(assignmentsResponseSchema, assignmentsRes.body, "assignments").data

  const existingDevice = me.devices?.find((d) => d.is_active !== false)
  let device: ScannerDevice

  if (existingDevice?.id) {
    device = existingDevice
  } else {
    const registerBody = deviceRegisterRequestSchema.parse({
      device_label: "Integration Test Device",
      user_agent: "myticket-scanner-integration-test/1.0",
    })
    const deviceRes = await apiRequest("/devices/register", {
      method: "POST",
      token: authToken,
      body: registerBody,
    })
    if (deviceRes.status !== 200 && deviceRes.status !== 201) {
      throw new Error(
        `POST /devices/register failed (${deviceRes.status}): ${JSON.stringify(deviceRes.body)}`,
      )
    }
    device = assertSchema(deviceResponseSchema, deviceRes.body, "registerDevice").data
  }

  const overrideEventId = getOptionalEventId()
  const eventId =
    overrideEventId ??
    assignments[0]?.event_id ??
    me.assignments?.[0]?.event_id

  if (!eventId) {
    throw new Error("No assigned event found for scanner account")
  }

  return {
    token: authToken,
    me,
    assignments,
    device,
    deviceId: device.id,
    eventId,
  }
}
