import { beforeAll, describe, expect, it } from "vitest"

import { meResponseSchema } from "@/shared/schemas/scanner"
import { apiRequest } from "../helpers/apiClient"
import { assertSchema } from "../helpers/assertSchema"
import { hasScannerCredentials } from "../helpers/env"
import { login } from "../helpers/authSession"

describe.skipIf(!hasScannerCredentials())("Accept-Language headers", () => {
  let token: string

  beforeAll(async () => {
    const session = await login()
    token = session.token
  })

  it("GET /me accepts Accept-Language: en", async () => {
    const res = await apiRequest("/me", { token, acceptLanguage: "en" })
    expect(res.status).toBe(200)
    assertSchema(meResponseSchema, res.body, "me")
  })

  it("GET /me accepts Accept-Language: ar", async () => {
    const res = await apiRequest("/me", { token, acceptLanguage: "ar" })
    expect(res.status).toBe(200)
    assertSchema(meResponseSchema, res.body, "me")
  })
})
