import { beforeAll, describe, expect, it } from "vitest"

import { deviceRegisterRequestSchema, deviceResponseSchema } from "@/shared/schemas/scanner"
import { apiRequest } from "../helpers/apiClient"
import { assertSchema } from "../helpers/assertSchema"
import { hasScannerCredentials } from "../helpers/env"
import { login } from "../helpers/authSession"

describe.skipIf(!hasScannerCredentials())("devices API", () => {
  let token: string

  beforeAll(async () => {
    const session = await login()
    token = session.token
  })

  it("POST /devices/register creates or returns a device matching schema", async () => {
    const body = deviceRegisterRequestSchema.parse({
      device_label: `Integration ${Date.now()}`,
      user_agent: "myticket-scanner-integration-test/1.0",
    })

    const res = await apiRequest("/devices/register", {
      method: "POST",
      token,
      body,
    })

    expect([200, 201]).toContain(res.status)
    const device = assertSchema(deviceResponseSchema, res.body, "registerDevice").data
    expect(device.id).toBeGreaterThan(0)
    expect(device.is_active).not.toBe(false)
  })

  it("POST /devices/{id}/heartbeat updates last_seen_at", async () => {
    const registerRes = await apiRequest("/devices/register", {
      method: "POST",
      token,
      body: deviceRegisterRequestSchema.parse({
        device_label: `Heartbeat ${Date.now()}`,
        user_agent: "myticket-scanner-integration-test/1.0",
      }),
    })

    const device = assertSchema(deviceResponseSchema, registerRes.body, "registerDevice").data

    const heartbeatRes = await apiRequest(`/devices/${device.id}/heartbeat`, {
      method: "POST",
      token,
      body: {},
    })

    expect(heartbeatRes.status).toBe(200)
    const updated = assertSchema(deviceResponseSchema, heartbeatRes.body, "heartbeat").data
    expect(updated.id).toBe(device.id)
    expect(updated.last_seen_at).toBeTruthy()
  })
})
