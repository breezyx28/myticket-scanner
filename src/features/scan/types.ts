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
