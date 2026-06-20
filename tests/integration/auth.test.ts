import { describe, expect, it } from "vitest"

import { isLoginSuccess } from "@/shared/schemas/authGuards"
import { loginResponseSchema } from "@/shared/schemas/auth"
import { messageResponseSchema } from "@/shared/schemas/common"
import { refreshTokenResponseSchema } from "@/shared/schemas/auth"
import { apiRequest } from "../helpers/apiClient"
import { assertSchema } from "../helpers/assertSchema"
import { hasScannerCredentials, requireCredentials } from "../helpers/env"
import { login } from "../helpers/authSession"

describe("auth API", () => {
  it("GET /me returns 401 without token", async () => {
    const res = await apiRequest("/me")
    expect(res.status).toBe(401)
  })

  it("POST /auth/password/forgot rejects invalid email format with 422", async () => {
    const res = await apiRequest("/auth/password/forgot", {
      method: "POST",
      body: { email: "not-an-email" },
    })

    expect(res.status).toBe(422)
  })

  describe.skipIf(!hasScannerCredentials())("with credentials", () => {
    it("POST /auth/login succeeds with valid credentials and matches schema", async () => {
      const { email, password } = requireCredentials()
      const res = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password },
      })

      expect(res.status).toBe(200)
      const parsed = assertSchema(loginResponseSchema, res.body, "login")
      expect(isLoginSuccess(parsed)).toBe(true)
      if (isLoginSuccess(parsed)) {
        expect(parsed.token.length).toBeGreaterThan(0)
        expect(parsed.user.role).toBe("scanner")
      }
    })

    it("POST /auth/login returns 422 for invalid credentials", async () => {
      const res = await apiRequest("/auth/login", {
        method: "POST",
        body: {
          email: "invalid-scanner@example.com",
          password: "wrong-password-integration-test",
        },
      })

      expect(res.status).toBe(422)
    })

    it("POST /auth/refresh returns a new token", async () => {
      const { token } = await login()
      const res = await apiRequest("/auth/refresh", {
        method: "POST",
        token,
        body: {},
      })

      expect(res.status).toBe(200)
      const parsed = assertSchema(refreshTokenResponseSchema, res.body, "refreshToken")
      expect(parsed.token.length).toBeGreaterThan(0)
    })

    it("POST /auth/logout succeeds with bearer token", async () => {
      const { token } = await login()
      const res = await apiRequest("/auth/logout", {
        method: "POST",
        token,
        body: {},
      })

      expect(res.status).toBe(200)
      assertSchema(messageResponseSchema, res.body, "logout")
    })
  })
})
