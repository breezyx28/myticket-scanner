import { Check } from "lucide-react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

const STEPS = [1, 2, 3] as const

export function PasswordResetStepper({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const { t } = useTranslation()

  const labels: Record<(typeof STEPS)[number], string> = {
    1: t("reset.stepEmail"),
    2: t("reset.stepCode"),
    3: t("reset.stepPassword"),
  }

  return (
    <nav aria-label={t("reset.stepperAria")} className="mb-1">
      <ol className="flex items-center gap-2">
        {STEPS.map((step, index) => {
          const done = step < currentStep
          const active = step === currentStep
          return (
            <li key={step} className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-colors",
                    done && "bg-lemon text-ink",
                    active && "bg-ink text-white shadow-card-sm",
                    !done && !active && "border border-ink-10 bg-white text-ink-40",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Check className="size-4" strokeWidth={2.5} aria-hidden /> : step}
                </span>
                <span
                  className={cn(
                    "truncate text-[10px] font-semibold uppercase tracking-wide",
                    active ? "text-ink" : "text-ink-40",
                  )}
                >
                  {labels[step]}
                </span>
              </div>
              {index < STEPS.length - 1 ? (
                <div
                  className={cn(
                    "mb-5 h-px min-w-2 flex-1",
                    done ? "bg-lemon" : "bg-ink-10",
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
