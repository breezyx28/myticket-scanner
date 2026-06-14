import Echo from "laravel-echo"
import Pusher from "pusher-js"

import { getBroadcastingAuthUrl, getReverbConfig, isReverbConfigured } from "@/config/reverb"

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

let echoInstance: Echo<"reverb"> | null = null
let echoToken: string | null = null

export function getEcho(token: string): Echo<"reverb"> | null {
  if (!isReverbConfigured()) return null

  if (echoInstance && echoToken === token) {
    return echoInstance
  }

  disconnectEcho()

  window.Pusher = Pusher
  echoToken = token

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
  }
}

export function getEchoConnectionState(): "connected" | "connecting" | "disconnected" | "unavailable" {
  if (!isReverbConfigured() || !echoInstance) return "unavailable"

  const state = echoInstance.connector.pusher.connection.state
  if (state === "connected") return "connected"
  if (state === "connecting") return "connecting"
  return "disconnected"
}
