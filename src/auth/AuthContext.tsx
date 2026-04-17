import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { clearSession, loadSession, resolveUserFromSession, saveSession } from "./session"
import type { LoginResult } from "./types"
import { MOCK_USERS } from "@/mocks/users"
import type { MockUser } from "@/mocks/types"

interface AuthContextValue {
  user: MockUser | null
  selectedEventId: string | null
  setSelectedEventId: (id: string) => void
  login: (email: string, password: string) => LoginResult
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function pickDefaultEvent(user: MockUser): string {
  return user.assignedEventIds[0] ?? ""
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialStored = loadSession()
  const initialUser = resolveUserFromSession(MOCK_USERS, initialStored)

  const [user, setUser] = useState<MockUser | null>(initialUser)
  const [selectedEventId, setSelectedEventIdState] = useState<string | null>(() => {
    if (initialStored?.selectedEventId && initialUser?.assignedEventIds.includes(initialStored.selectedEventId)) {
      return initialStored.selectedEventId
    }
    if (initialUser) return pickDefaultEvent(initialUser)
    return null
  })

  const setSelectedEventId = useCallback(
    (id: string) => {
      setSelectedEventIdState(id)
      if (user) saveSession({ email: user.email, selectedEventId: id })
    },
    [user],
  )

  const login = useCallback((email: string, password: string): LoginResult => {
    const normalized = email.trim().toLowerCase()
    const found = MOCK_USERS.find((u) => u.email.toLowerCase() === normalized)
    if (!found || found.password !== password) {
      return { ok: false, reason: "invalid_credentials" }
    }
    const ev = pickDefaultEvent(found)
    setUser(found)
    setSelectedEventIdState(ev)
    saveSession({ email: found.email, selectedEventId: ev })
    return { ok: true as const }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setSelectedEventIdState(null)
    clearSession()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      selectedEventId,
      setSelectedEventId,
      login,
      logout,
    }),
    [user, selectedEventId, setSelectedEventId, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
