import { useEffect, type ReactNode } from "react"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { restoreScannerSession } from "@/features/auth/restoreSession"
import { selectAuthStatus, selectToken } from "@/features/auth/authSlice"

export function AppBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectToken)
  const status = useAppSelector(selectAuthStatus)

  useEffect(() => {
    if (!token) return
    void restoreScannerSession(dispatch)
  }, [dispatch, token])

  if (token && status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-ink text-sm text-white/70">
        Loading scanner session…
      </div>
    )
  }

  return children
}
