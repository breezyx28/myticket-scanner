import { useTranslation } from "react-i18next"
import { Toaster } from "sonner"

import { localeDirection } from "@/i18n/config"

export function AppToaster() {
  const { i18n, t } = useTranslation()

  return (
    <Toaster
      richColors
      position="top-center"
      closeButton
      dir={localeDirection(i18n.language)}
      containerAriaLabel={t("common.toastContainerAria")}
      toastOptions={{
        closeButtonAriaLabel: t("common.close"),
      }}
    />
  )
}
