import { QrCode, Ticket } from "lucide-react"
import { Link } from "react-router-dom"

import { CrossPattern } from "@/components/shapes/CrossOrnament"
import { cn } from "@/lib/utils"

function BrandMark({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      to="/login"
      className={cn(
        "group inline-flex items-center gap-3 rounded-2xl py-1 transition-opacity hover:opacity-90",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        inverted
          ? "focus-visible:ring-white focus-visible:ring-offset-ink"
          : "focus-visible:ring-ink focus-visible:ring-offset-white",
      )}
    >
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-xl shadow-card-sm sm:size-12 sm:rounded-2xl",
          "bg-lemon text-ink",
        )}
      >
        <Ticket className="size-5 sm:size-6" strokeWidth={2.5} aria-hidden />
      </span>
      <span className="flex flex-col items-start gap-1">
        <span
          className={cn(
            "font-extrabold text-[1.05rem] leading-none tracking-tight sm:text-lg",
            inverted ? "text-white" : "text-ink",
          )}
        >
          My<span className="text-coral">Ticket</span>
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
            inverted
              ? "border border-white/20 bg-white/10 text-white/80"
              : "border border-ink-10 bg-white text-ink-60",
          )}
        >
          Scanner
        </span>
      </span>
    </Link>
  )
}

export function AuthLayout({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,520px)]">
      <aside className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between lg:px-10 lg:py-12 xl:px-14">
        <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-coral/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-24 -left-10 size-40 rounded-full bg-lemon/15 blur-3xl" />

        <div className="relative z-10">
          <BrandMark inverted />
        </div>

        <div className="relative z-10 max-w-md space-y-8">
          <div className="space-y-4">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Gate validation
            </p>
            <h1 className="text-[2.25rem] font-extrabold leading-[1.05] tracking-[-0.03em] xl:text-5xl">
              Scan tickets.
              <br />
              <span className="text-lemon">Let fans in.</span>
            </h1>
            <p className="max-w-[38ch] text-base leading-relaxed text-white/65">
              Secure entry for assigned events — one-time or multi-scan, synced with the live
              MyTicket API.
            </p>
          </div>

          <ul className="flex flex-col gap-3 text-sm text-white/75">
            <li className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <QrCode className="size-4 text-lemon" strokeWidth={2} aria-hidden />
              </span>
              Camera, manual entry, and simulate scan
            </li>
            <li className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-coral/25">
                <Ticket className="size-4 text-coral-light" strokeWidth={2} aria-hidden />
              </span>
              Real-time valid, duplicate, and expired results
            </li>
          </ul>

          <CrossPattern />
        </div>

        <p className="relative z-10 text-xs text-white/40">
          Scanner accounts only · Contact your organizer for access
        </p>
      </aside>

      <div className="flex min-h-dvh flex-col bg-surface-tint">
        <header className="flex shrink-0 justify-center border-b border-ink-10/80 bg-white px-4 py-6 lg:hidden">
          <BrandMark />
        </header>

        <main
          className={cn(
            "mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 lg:max-w-[480px] lg:px-10",
            className,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
