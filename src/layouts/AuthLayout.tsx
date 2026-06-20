import { Ticket } from "lucide-react"
import { Trans, useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { LanguageSwitcher } from "@/components/common/LanguageSwitcher"
import { cn } from "@/lib/utils"

export function AuthLayout({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { t } = useTranslation()

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-white">
      <header className="flex shrink-0 items-center justify-between px-4 pb-4 pt-[max(2rem,env(safe-area-inset-top))] sm:px-6 sm:pb-4 sm:pt-[max(2.5rem,env(safe-area-inset-top))]">
        <Link
          to="/login"
          className="group inline-flex items-center gap-3 rounded-2xl px-2 py-1 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <span className="flex size-12 items-center justify-center rounded-2xl border border-ink-10 bg-ink-5">
            <Ticket className="size-6 text-ink" strokeWidth={2.2} />
          </span>
          <span className="flex flex-col items-start gap-0.5">
            <span className="font-extrabold text-[1.05rem] leading-none tracking-tight text-ink sm:text-lg">
              <Trans
                i18nKey="auth.brandName"
                components={{ coral: <span className="text-coral" /> }}
              />
            </span>
            <span className="rounded-full border border-ink-10 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-60">
              {t("auth.brandScanner")}
            </span>
          </span>
        </Link>
        <LanguageSwitcher variant="light" />
      </header>

      <main
        className={cn(
          "mx-auto flex w-full max-w-[440px] min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-6",
          className,
        )}
      >
        <div className="flex flex-1 flex-col justify-center py-4 sm:py-6">{children}</div>
      </main>
    </div>
  )
}
