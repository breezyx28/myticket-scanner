const STORAGE_KEY = "myticket-scanner-password-reset-v1"

export interface PasswordResetSession {
  email: string
  sentAt: number
  otp?: string
}

export function readPasswordResetSession(): PasswordResetSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PasswordResetSession
    if (!parsed.email || !parsed.sentAt) return null
    return parsed
  } catch {
    return null
  }
}

export function writePasswordResetSession(data: PasswordResetSession): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function patchPasswordResetSession(patch: Partial<PasswordResetSession>): PasswordResetSession | null {
  const current = readPasswordResetSession()
  if (!current && !patch.email) return null
  const next: PasswordResetSession = {
    email: patch.email ?? current?.email ?? "",
    sentAt: patch.sentAt ?? current?.sentAt ?? 0,
    otp: patch.otp ?? current?.otp,
  }
  if (!next.email || !next.sentAt) return null
  writePasswordResetSession(next)
  return next
}

export function clearPasswordResetSession(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}
