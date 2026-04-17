export type ScanMode = "one_time" | "multi_scan"

export type TicketStatus = "active" | "used" | "expired"

export interface MockEvent {
  id: string
  name: string
  venue: string
  /** ISO datetime — after this, scans show Expired */
  endsAt: string
  scanMode: ScanMode
}

export interface MockTicket {
  id: string
  eventId: string
  holderName: string
  section: string
  seat: string
  type: string
  status: TicketStatus
  secret: string
}

export interface MockUser {
  email: string
  password: string
  isScanner: boolean
  assignedEventIds: string[]
}

export type ScanResultKind = "success" | "failed" | "used" | "expired"

export interface ScanSuccessDetail {
  kind: "success"
  holderName: string
  eventName: string
  venue: string
  section: string
  seat: string
  ticketType: string
}

export interface ScanFailedDetail {
  kind: "failed"
  message: string
}

export interface ScanUsedDetail {
  kind: "used"
  holderName: string
  eventName: string
}

export interface ScanExpiredDetail {
  kind: "expired"
  message: string
}

export type ScanResultDetail =
  | ScanSuccessDetail
  | ScanFailedDetail
  | ScanUsedDetail
  | ScanExpiredDetail
