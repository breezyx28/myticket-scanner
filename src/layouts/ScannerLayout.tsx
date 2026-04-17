import { LogOut, Ticket } from "lucide-react"
import { Link } from "react-router-dom"

import { useAuth } from "@/auth/AuthContext"
import { Button } from "@/components/ui/button"
import { MOCK_EVENTS } from "@/mocks/events"
import { cn } from "@/lib/utils"

export function ScannerLayout({
  toolbar,
  children,
}: {
  toolbar?: React.ReactNode
  children: React.ReactNode
}) {
  const { user, logout, selectedEventId } = useAuth()
  const ev = MOCK_EVENTS.find((e) => e.id === selectedEventId)

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
          aria-label="Scanner home"
        >
          <Ticket className="size-5 text-ink sm:size-[22px]" strokeWidth={2.2} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wide text-white/45 sm:text-xs sm:normal-case sm:tracking-normal">
            <span className="sm:hidden">Active</span>
            <span className="hidden sm:inline">Signed in</span>
          </p>
          <p className="truncate text-xs font-semibold sm:text-sm">{user?.email}</p>
        </div>
        {ev ? (
          <span
            className="max-w-[min(30vw,7rem)] truncate rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium text-white/80 sm:max-w-[40%] sm:px-3 sm:py-1.5 sm:text-xs"
            title={ev.scanMode === "one_time" ? "One-time entry" : "Multi-scan / re-entry"}
          >
            <span className="sm:hidden">{ev.scanMode === "one_time" ? "Once" : "Multi"}</span>
            <span className="hidden sm:inline">
              {ev.scanMode === "one_time" ? "One-time entry" : "Multi-scan / re-entry"}
            </span>
          </span>
        ) : null}
        <div className="flex min-w-0 shrink items-center gap-1.5 sm:gap-2">{toolbar}</div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 shrink-0 text-white hover:bg-white/10 sm:size-12"
          onClick={() => logout()}
          aria-label="Log out"
        >
          <LogOut className="size-5" />
        </Button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  )
}
