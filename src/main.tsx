import "@fontsource/plus-jakarta-sans/400.css"
import "@fontsource/plus-jakarta-sans/500.css"
import "@fontsource/plus-jakarta-sans/600.css"
import "@fontsource/plus-jakarta-sans/700.css"
import "@fontsource/plus-jakarta-sans/800.css"
import "@fontsource/space-grotesk/500.css"
import "@fontsource/space-grotesk/700.css"
import "@fontsource/noto-sans-arabic/400.css"
import "@fontsource/noto-sans-arabic/500.css"
import "@fontsource/noto-sans-arabic/600.css"
import "@fontsource/noto-sans-arabic/700.css"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { I18nextProvider } from "react-i18next"
import { BrowserRouter } from "react-router-dom"

import { AppBootstrap } from "@/app/AppBootstrap"
import { AppStoreProvider } from "@/app/provider"
import { AppToaster } from "@/components/common/AppToaster"
import i18n from "@/i18n/config"
import { LocaleProvider } from "@/i18n/LocaleProvider"
import { initNativeShell } from "@/platform/nativeBootstrap"
import App from "./App.tsx"
import "./index.css"

void initNativeShell()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppStoreProvider>
      <I18nextProvider i18n={i18n}>
        <LocaleProvider>
          <BrowserRouter>
            <AppBootstrap>
              <App />
              <AppToaster />
            </AppBootstrap>
          </BrowserRouter>
        </LocaleProvider>
      </I18nextProvider>
    </AppStoreProvider>
  </StrictMode>,
)
