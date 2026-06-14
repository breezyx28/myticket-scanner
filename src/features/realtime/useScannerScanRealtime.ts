import { useEffect, useMemo, useRef, useState } from "react"

import { useAppSelector } from "@/app/hooks"
import {
  selectAuthStatus,
  selectDeviceId,
  selectScannerAccountId,
  selectSelectedEventId,
  selectToken,
} from "@/features/auth/authSlice"
import { disconnectEcho, getEcho } from "@/lib/echo/client"
import { isReverbConfigured } from "@/config/reverb"
import { parseScanRecordedEnvelope, type ScanRealtimeRow } from "@/shared/schemas/realtime"

export type RealtimeConnectionState = "idle" | "connecting" | "connected" | "unavailable"

interface UseScannerScanRealtimeOptions {
  onRemoteScan?: (row: ScanRealtimeRow) => void
}

export function useScannerScanRealtime(options: UseScannerScanRealtimeOptions = {}) {
  const token = useAppSelector(selectToken)
  const authStatus = useAppSelector(selectAuthStatus)
  const scannerAccountId = useAppSelector(selectScannerAccountId)
  const deviceId = useAppSelector(selectDeviceId)
  const selectedEventId = useAppSelector(selectSelectedEventId)

  const onRemoteScanRef = useRef(options.onRemoteScan)
  const [liveState, setLiveState] = useState<RealtimeConnectionState>("idle")

  const canSubscribe =
    authStatus === "authenticated" &&
    Boolean(token) &&
    scannerAccountId != null &&
    isReverbConfigured()

  useEffect(() => {
    onRemoteScanRef.current = options.onRemoteScan
  }, [options.onRemoteScan])

  useEffect(() => {
    if (!canSubscribe || !token || scannerAccountId == null) return

    const echo = getEcho(token)
    if (!echo) return

    const channelName = `scanner.${scannerAccountId}.scans`
    const channel = echo.private(channelName)
    const pusher = echo.connector.pusher

    const syncConnectionState = () => {
      const state = pusher.connection.state
      if (state === "connected") {
        setLiveState("connected")
        return
      }
      if (state === "connecting") {
        setLiveState("connecting")
        return
      }
      if (state === "unavailable" || state === "failed") {
        setLiveState("unavailable")
        return
      }
      setLiveState("connecting")
    }

    const handleScanRecorded = (envelope: unknown) => {
      const row = parseScanRecordedEnvelope(envelope)
      if (!row) return
      if (deviceId != null && row.device_id === deviceId) return
      if (selectedEventId != null && row.event_id !== selectedEventId) return
      onRemoteScanRef.current?.(row)
    }

    channel.listen(".scan.recorded", handleScanRecorded)

    pusher.connection.bind("connected", syncConnectionState)
    pusher.connection.bind("connecting", syncConnectionState)
    pusher.connection.bind("disconnected", syncConnectionState)
    pusher.connection.bind("unavailable", syncConnectionState)
    pusher.connection.bind("failed", syncConnectionState)

    return () => {
      channel.stopListening(".scan.recorded")
      echo.leave(channelName)
      pusher.connection.unbind("connected", syncConnectionState)
      pusher.connection.unbind("connecting", syncConnectionState)
      pusher.connection.unbind("disconnected", syncConnectionState)
      pusher.connection.unbind("unavailable", syncConnectionState)
      pusher.connection.unbind("failed", syncConnectionState)
      setLiveState("idle")
    }
  }, [canSubscribe, deviceId, scannerAccountId, selectedEventId, token])

  useEffect(() => {
    if (!token) disconnectEcho()
  }, [token])

  const connectionState = useMemo((): RealtimeConnectionState => {
    if (!isReverbConfigured()) return "unavailable"
    if (!canSubscribe) return "idle"
    return liveState === "idle" ? "connecting" : liveState
  }, [canSubscribe, liveState])

  return { connectionState }
}
