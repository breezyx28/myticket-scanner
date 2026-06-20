import { describe, expect, it } from "vitest"

import { apiRequest } from "../helpers/apiClient"

describe("public health endpoints", () => {
  it("GET /health returns scanner status", async () => {
    const res = await apiRequest<{ app: string; status: string; version: string }>("/health")
    expect(res.status).toBe(200)
    expect(res.body.app).toBe("scanner")
    expect(res.body.status).toBe("ok")
    expect(res.body.version).toBe("v1")
  })

  it("GET /version returns api version metadata", async () => {
    const res = await apiRequest<{ app: string; api_version: string }>("/version")
    expect(res.status).toBe(200)
    expect(res.body.app).toBe("scanner")
    expect(res.body.api_version).toBe("v1")
  })
})
