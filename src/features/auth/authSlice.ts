import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { AuthUser } from "@/shared/schemas/auth"
import type { Assignment } from "@/shared/schemas/scanner"

import { isNativePlatform } from "@/platform/detect"

import { clearSession, loadSession, saveSession, type StoredSession } from "./session"

export type AuthStatus = "idle" | "loading" | "authenticated" | "hydrating"

export interface AuthState {
  token: string | null
  user: AuthUser | null
  scannerAccountId: number | null
  deviceId: number | null
  selectedEventId: number | null
  assignments: Assignment[]
  status: AuthStatus
  bootstrapError: string | null
}

const stored = loadSession()

const initialState: AuthState = {
  token: stored?.token ?? null,
  user: stored
    ? {
        id: stored.userId,
        email: stored.email,
        full_name: stored.fullName,
        role: "scanner",
      }
    : null,
  deviceId: stored?.deviceId ?? null,
  scannerAccountId: null,
  selectedEventId: stored?.selectedEventId ?? null,
  assignments: [],
  status: stored?.token ? "loading" : isNativePlatform() ? "hydrating" : "idle",
  bootstrapError: null,
}

function persistFromState(state: AuthState): void {
  if (!state.token || !state.user) {
    clearSession()
    return
  }
  const payload: StoredSession = {
    token: state.token,
    userId: state.user.id,
    email: state.user.email ?? null,
    fullName: state.user.full_name ?? null,
    deviceId: state.deviceId,
    selectedEventId: state.selectedEventId,
  }
  saveSession(payload)
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>,
    ) {
      state.token = action.payload.token
      state.user = action.payload.user
      state.status = "authenticated"
      state.bootstrapError = null
      persistFromState(state)
    },
    setScannerAccountId(state, action: PayloadAction<number>) {
      state.scannerAccountId = action.payload
    },
    setDeviceId(state, action: PayloadAction<number>) {
      state.deviceId = action.payload
      persistFromState(state)
    },
    setAssignments(state, action: PayloadAction<Assignment[]>) {
      state.assignments = action.payload
      const ids = action.payload.map((a) => a.event_id)
      if (state.selectedEventId == null || !ids.includes(state.selectedEventId)) {
        state.selectedEventId = action.payload[0]?.event_id ?? null
      }
      if (state.token) state.status = "authenticated"
      state.bootstrapError = null
      persistFromState(state)
    },
    setSelectedEventId(state, action: PayloadAction<number>) {
      state.selectedEventId = action.payload
      persistFromState(state)
    },
    setBootstrapLoading(state) {
      state.status = "loading"
      state.bootstrapError = null
    },
    setBootstrapError(state, action: PayloadAction<string>) {
      state.bootstrapError = action.payload
      state.status = "idle"
    },
    rehydrateSession(state, action: PayloadAction<StoredSession>) {
      const stored = action.payload
      state.token = stored.token
      state.user = {
        id: stored.userId,
        email: stored.email,
        full_name: stored.fullName,
        role: "scanner",
      }
      state.deviceId = stored.deviceId
      state.selectedEventId = stored.selectedEventId
      state.status = "loading"
      state.bootstrapError = null
    },
    setHydrationComplete(state) {
      if (state.status === "hydrating") {
        state.status = "idle"
      }
    },
    clearAuth(state) {
      state.token = null
      state.user = null
      state.scannerAccountId = null
      state.deviceId = null
      state.selectedEventId = null
      state.assignments = []
      state.status = "idle"
      state.bootstrapError = null
    },
  },
})

export const {
  setCredentials,
  setScannerAccountId,
  setDeviceId,
  setAssignments,
  setSelectedEventId,
  setBootstrapLoading,
  setBootstrapError,
  rehydrateSession,
  setHydrationComplete,
  clearAuth,
} = authSlice.actions

export const selectToken = (state: { auth: AuthState }) => state.auth.token
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectScannerAccountId = (state: { auth: AuthState }) => state.auth.scannerAccountId
export const selectDeviceId = (state: { auth: AuthState }) => state.auth.deviceId
export const selectSelectedEventId = (state: { auth: AuthState }) => state.auth.selectedEventId
export const selectAssignments = (state: { auth: AuthState }) => state.auth.assignments
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status
export const selectIsAuthenticated = (state: { auth: AuthState }) => Boolean(state.auth.token)
export const selectSelectedAssignment = (state: { auth: AuthState }) => {
  const id = state.auth.selectedEventId
  if (id == null) return null
  return state.auth.assignments.find((a) => a.event_id === id) ?? null
}
