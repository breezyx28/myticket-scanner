import { useTranslation } from "react-i18next"

import { useLocale } from "@/i18n/LocaleProvider"
import type { AppLocale } from "@/i18n/config"
import { cn } from "@/lib/utils"

const OPTIONS: { value: AppLocale; labelKey: "language.en" | "language.ar" }[] = [
  { value: "ar", labelKey: "language.ar" },
  { value: "en", labelKey: "language.en" },
]

export function LanguageSwitcher({
  variant = "light",
  className,
}: {
  variant?: "light" | "dark"
  className?: string
}) {
  const { t } = useTranslation()
  const { locale, setLocale } = useLocale()

  return (
    <div
      role="group"
      aria-label={t("language.switchLabel")}
      className={cn("inline-flex rounded-full border p-0.5", className, {
        "border-ink-10 bg-ink-5": variant === "light",
        "border-white/20 bg-white/10": variant === "dark",
      })}
    >
      {OPTIONS.map(({ value, labelKey }) => {
        const active = locale === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => setLocale(value)}
            aria-pressed={active}
            className={cn(
              "min-h-[32px] rounded-full px-2.5 text-[11px] font-bold transition-colors sm:px-3 sm:text-xs",
              variant === "light" && active && "bg-ink text-white shadow-card-sm",
              variant === "light" && !active && "text-ink-60 hover:text-ink",
              variant === "dark" && active && "bg-white text-ink shadow-card-sm",
              variant === "dark" && !active && "text-white/70 hover:text-white",
            )}
          >
            {t(labelKey)}
          </button>
        )
      })}
    </div>
  )
}
