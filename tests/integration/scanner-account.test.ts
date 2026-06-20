import { beforeAll, describe, expect, it } from "vitest"

import { assignmentsResponseSchema, meResponseSchema } from "@/shared/schemas/scanner"
import { apiRequest } from "../helpers/apiClient"
import { assertSchema } from "../helpers/assertSchema"
import { hasScannerCredentials } from "../helpers/env"
import { login } from "../helpers/authSession"

describe.skipIf(!hasScannerCredentials())("scanner account API", () => {
  let token: string

  beforeAll(async () => {
    const session = await login()
    token = session.token
  })

  it("GET /me returns scanner account with schema", async () => {
    const res = await apiRequest("/me", { token })
    expect(res.status).toBe(200)

    const me = assertSchema(meResponseSchema, res.body, "me").data
    expect(me.is_active).toBe(true)
    expect(me.user_id).toBeGreaterThan(0)
  })

  it("GET /assignments returns active assignments with event metadata", async () => {
    const res = await apiRequest("/assignments", { token })
    expect(res.status).toBe(200)

    const assignments = assertSchema(assignmentsResponseSchema, res.body, "assignments").data
    expect(Array.isArray(assignments)).toBe(true)

    if (assignments.length > 0) {
      const first = assignments[0]
      expect(first.event_id).toBeGreaterThan(0)
      expect(first.revoked_at ?? null).toBeNull()
      if (first.event) {
        expect(first.event.id).toBe(first.event_id)
      }
    }
  })
})
