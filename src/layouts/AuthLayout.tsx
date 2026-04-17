import { Ticket } from "lucide-react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

export function AuthLayout({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="flex shrink-0 justify-center px-4 pt-8 pb-4 sm:pt-10">
        <Link
          to="/login"
          className="group inline-flex items-center gap-3 rounded-2xl px-2 py-1 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <span className="flex size-12 items-center justify-center rounded-2xl border border-ink-10 bg-ink-5">
            <Ticket className="size-6 text-ink" strokeWidth={2.2} />
          </span>
          <span className="flex flex-col items-start gap-0.5">
            <span className="font-extrabold text-[1.05rem] leading-none tracking-tight text-ink sm:text-lg">
              My<span className="text-coral">Ticket</span>
            </span>
            <span className="rounded-full border border-ink-10 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-60">
              Scanner
            </span>
          </span>
        </Link>
      </header>

      <main
        className={cn(
          "mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center px-4 pb-10 pt-2 sm:px-6 sm:pb-14",
          className,
        )}
      >
        {children}
      </main>
    </div>
  )
}
