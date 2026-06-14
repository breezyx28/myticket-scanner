import { cn } from "@/lib/utils"

export const authInputClass = cn(
  "min-h-[52px] rounded-2xl border-ink-10 bg-white text-base text-ink shadow-card-sm",
  "placeholder:text-ink-40",
  "transition-[border-color,box-shadow] duration-200",
  "focus-visible:border-ink/20 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-ink/10",
)

export const authOtpInputClass = cn(
  authInputClass,
  "font-mono text-center text-2xl tracking-[0.35em] tabular-nums",
)
