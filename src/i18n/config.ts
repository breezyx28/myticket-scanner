import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import ar from "./locales/ar.json"
import en from "./locales/en.json"

export const LOCALE_STORAGE_KEY = "myticket-scanner-locale"
export const SUPPORTED_LOCALES = ["ar", "en"] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

function readStoredLocale(): AppLocale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored === "ar" || stored === "en") return stored
  } catch {
    /* private browsing */
  }
  return "ar"
}

export function getAcceptLanguageHeader(): "ar" | "en" {
  const lng = i18n.language || readStoredLocale()
  return lng === "ar" ? "ar" : "en"
}

export function localeDirection(locale: string): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr"
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: readStoredLocale(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
})

i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, lng)
  } catch {
    /* private browsing */
  }
  document.documentElement.lang = lng
  document.documentElement.dir = localeDirection(lng)
  document.title = i18n.t("common.appName")
})

const initialLocale = readStoredLocale()
document.documentElement.lang = initialLocale
document.documentElement.dir = localeDirection(initialLocale)
document.title = i18n.t("common.appName")

export default i18n
