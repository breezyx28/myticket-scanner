import { useEffect, useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  rehydrateSession,
  selectAuthStatus,
  selectToken,
  setHydrationComplete,
} from "@/features/auth/authSlice"
import { loadSessionAsync } from "@/features/auth/session"
import { restoreScannerSession } from "@/features/auth/restoreSession"
import { isNativePlatform } from "@/platform/detect"

export function AppBootstrap({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectToken)
  const status = useAppSelector(selectAuthStatus)
  const [nativeReady, setNativeReady] = useState(!isNativePlatform())

  useEffect(() => {
    if (!isNativePlatform()) return

    void (async () => {
      const stored = await loadSessionAsync()
      if (stored) {
        dispatch(rehydrateSession(stored))
      } else {
        dispatch(setHydrationComplete())
      }
      setNativeReady(true)
    })()
  }, [dispatch])

  useEffect(() => {
    if (!token) return
    void restoreScannerSession(dispatch)
  }, [dispatch, token])

  if (!nativeReady || (token && status === "loading") || status === "hydrating") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-ink text-sm text-white/70">
        {t("common.loading")}
      </div>
    )
  }

  return children
}
