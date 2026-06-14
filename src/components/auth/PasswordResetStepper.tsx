import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const STEPS = [
  { step: 1, label: "Email" },
  { step: 2, label: "Code" },
  { step: 3, label: "Password" },
] as const

export function PasswordResetStepper({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <nav aria-label="Password reset progress" className="mb-1">
      <ol className="flex items-center gap-2">
        {STEPS.map(({ step, label }, index) => {
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
                  {label}
                </span>
              </div>
              {index < STEPS.length - 1 ? (
                <span
                  className={cn(
                    "mb-5 h-px flex-1 min-w-[0.75rem]",
                    step < currentStep ? "bg-lemon-dark/60" : "bg-ink-10",
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
