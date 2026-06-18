import { useEffect, useRef, type ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { useAppDispatch } from "@/app/hooks"
import { localeDirection, type AppLocale } from "@/i18n/config"
import { baseApi } from "@/shared/api/baseApi"

function LocaleEffects() {
  const dispatch = useAppDispatch()
  const { i18n } = useTranslation()
  const prevLanguage = useRef(i18n.language)

  useEffect(() => {
    if (prevLanguage.current === i18n.language) return
    prevLanguage.current = i18n.language
    dispatch(baseApi.util.invalidateTags(["Me", "Assignments", "Device"]))
  }, [dispatch, i18n.language])

  return null
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { i18n, t } = useTranslation()

  useEffect(() => {
    document.title = t("common.appName")
  }, [i18n.language, t])

  return (
    <>
      <LocaleEffects />
      {children}
    </>
  )
}

export function useLocale() {
  const { i18n } = useTranslation()

  const setLocale = (locale: AppLocale) => {
    void i18n.changeLanguage(locale)
  }

  return {
    locale: i18n.language as AppLocale,
    direction: localeDirection(i18n.language),
    setLocale,
  }
}
