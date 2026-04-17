export type LoginFailureReason = "invalid_credentials" | "not_scanner"

export type LoginResult = { ok: true } | { ok: false; reason: LoginFailureReason }
