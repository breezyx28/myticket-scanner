import { LogOut, Ticket } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { useLogoutMutation } from "@/features/auth/authApi"
import { clearAuthSession } from "@/features/auth/clearAuthSession"
import {
  selectSelectedAssignment,
  selectUser,
} from "@/features/auth/authSlice"
import { Button } from "@/components/ui/button"
import { parseApiError } from "@/shared/lib/parseApiError"
import { cn } from "@/lib/utils"

export function ScannerLayout({
  toolbar,
  children,
}: {
  toolbar?: React.ReactNode
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectUser)
  const assignment = useAppSelector(selectSelectedAssignment)
  const [logoutApi] = useLogoutMutation()

  const entryMode = assignment?.event?.entry_mode
  const entryModeLabel =
    entryMode === "one_time"
      ? { short: t("scanner.layout.entryOnceShort"), long: t("scanner.layout.entryOnceLong") }
      : entryMode === "multi_scan"
        ? { short: t("scanner.layout.entryMultiShort"), long: t("scanner.layout.entryMultiLong") }
        : null

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap()
    } catch (error) {
      const parsed = parseApiError(error)
      if (parsed.status !== 401) {
        toast.error(parsed.message)
      }
    } finally {
      await clearAuthSession(dispatch)
      navigate("/login", { replace: true })
    }
  }

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-ink text-white">
      <header
        className={cn(
          "flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2.5",
          "pt-[max(0.625rem,env(safe-area-inset-top))] sm:gap-3 sm:px-4 sm:py-3",
        )}
      >
        <Link
          to="/"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-lemon sm:size-12 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          aria-label={t("scanner.layout.homeAria")}
        >
          <Ticket className="size-5 text-ink sm:size-[22px]" strokeWidth={2.2} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wide text-white/45 sm:text-xs sm:normal-case sm:tracking-normal">
            <span className="sm:hidden">{t("scanner.layout.active")}</span>
            <span className="hidden sm:inline">{t("scanner.layout.signedIn")}</span>
          </p>
          <p className="truncate text-xs font-semibold sm:text-sm">
            {user?.email ?? user?.full_name ?? t("scanner.layout.scannerUser")}
          </p>
        </div>
        {entryModeLabel ? (
          <span
            className="max-w-[min(30vw,7rem)] truncate rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium text-white/80 sm:max-w-[40%] sm:px-3 sm:py-1.5 sm:text-xs"
            title={entryModeLabel.long}
          >
            <span className="sm:hidden">{entryModeLabel.short}</span>
            <span className="hidden sm:inline">{entryModeLabel.long}</span>
          </span>
        ) : null}
        <div className="flex min-w-0 shrink items-center gap-1.5 sm:gap-2">{toolbar}</div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 shrink-0 text-white hover:bg-white/10 sm:size-12"
          onClick={() => void handleLogout()}
          aria-label={t("scanner.layout.logoutAria")}
        >
          <LogOut className="size-5" />
        </Button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  )
}
