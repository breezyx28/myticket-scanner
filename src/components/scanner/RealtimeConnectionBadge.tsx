import { cn } from "@/lib/utils"
import type { RealtimeConnectionState } from "@/features/realtime/useScannerScanRealtime"

const STATE_COPY: Record<Exclude<RealtimeConnectionState, "idle" | "unavailable">, string> = {
  connecting: "Sync connecting",
  connected: "Live sync on",
}

export function RealtimeConnectionBadge({
  state,
  className,
}: {
  state: RealtimeConnectionState
  className?: string
}) {
  if (state === "idle" || state === "unavailable") return null

  const connected = state === "connected"

  return (
    <span
      className={cn(
        "inline-flex max-w-[7.5rem] items-center gap-1.5 truncate rounded-full border px-2 py-1 text-[10px] font-semibold sm:max-w-none sm:px-2.5 sm:text-xs",
        connected
          ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
          : "border-amber-400/30 bg-amber-500/15 text-amber-100",
        className,
      )}
      title={STATE_COPY[state]}
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          connected ? "bg-emerald-400" : "animate-pulse bg-amber-300",
        )}
        aria-hidden
      />
      <span className="truncate">{STATE_COPY[state]}</span>
    </span>
  )
}
