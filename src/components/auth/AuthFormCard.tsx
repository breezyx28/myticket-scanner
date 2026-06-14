import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AuthFormCardProps {
  icon: LucideIcon
  iconClassName?: string
  eyebrow: string
  tagline: string
  title: string
  description: string
  children: React.ReactNode
  className?: string
}

export function AuthFormCard({
  icon: Icon,
  iconClassName,
  eyebrow,
  tagline,
  title,
  description,
  children,
  className,
}: AuthFormCardProps) {
  return (
    <Card className={cn("overflow-hidden border-ink-10 bg-white shadow-card-lg", className)}>
      <div className="border-b border-ink-10 bg-gradient-to-br from-lemon/30 via-white to-sky/20 px-6 py-5 sm:px-8">
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-lemon text-ink shadow-card-sm",
              iconClassName,
            )}
          >
            <Icon className="size-6" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0 space-y-1 pt-0.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-40">{eyebrow}</p>
            <p className="text-sm font-semibold text-ink-60">{tagline}</p>
          </div>
        </div>
      </div>

      <CardHeader className="space-y-2 px-6 pb-0 pt-7 sm:px-8 sm:pt-8">
        <CardTitle className="text-[1.75rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink sm:text-[2rem]">
          {title}
        </CardTitle>
        <CardDescription className="max-w-[36ch] text-[15px] leading-relaxed text-ink-60">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-8 pt-5 sm:px-8 sm:pb-10">{children}</CardContent>
    </Card>
  )
}
