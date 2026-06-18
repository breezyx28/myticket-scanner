import Echo from "laravel-echo"
import Pusher from "pusher-js"

import { getBroadcastingAuthUrl, getReverbConfig, isReverbConfigured } from "@/config/reverb"
import { getAcceptLanguageHeader } from "@/i18n/config"

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

let echoInstance: Echo<"reverb"> | null = null
let echoToken: string | null = null
let echoLanguage: string | null = null

export function getEcho(token: string): Echo<"reverb"> | null {
  if (!isReverbConfigured()) return null

  const language = getAcceptLanguageHeader()

  if (echoInstance && echoToken === token && echoLanguage === language) {
    return echoInstance
  }

  disconnectEcho()

  window.Pusher = Pusher
  echoToken = token
  echoLanguage = language

  const reverb = getReverbConfig()

  echoInstance = new Echo({
    broadcaster: "reverb",
    key: reverb.key,
    wsHost: reverb.host,
    wsPort: reverb.wsPort,
    wssPort: reverb.wssPort,
    forceTLS: reverb.forceTls,
    enabledTransports: ["ws", "wss"],
    authEndpoint: getBroadcastingAuthUrl(),
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Accept-Language": getAcceptLanguageHeader(),
      },
    },
  })

  return echoInstance
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect()
    echoInstance = null
    echoToken = null
    echoLanguage = null
  }
}

export function getEchoConnectionState(): "connected" | "connecting" | "disconnected" | "unavailable" {
  if (!isReverbConfigured() || !echoInstance) return "unavailable"

  const state = echoInstance.connector.pusher.connection.state
  if (state === "connected") return "connected"
  if (state === "connecting") return "connecting"
  return "disconnected"
}
