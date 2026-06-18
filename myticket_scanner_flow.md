# MyTicket — Scanner App Flow (Implementation Synced)

> **Type:** Scanner App (Standalone web frontend)  
> **Runtime:** Vite + React + TypeScript + Tailwind v4  
> **Current State:** Online MVP — Redux Toolkit + RTK Query + Zod against production Scanner API  
> **Source of truth:** Current code in `scanner/src/*` + `SCANNER_API_ENDPOINTS.md`  
> **Last Synced:** May 20, 2026

---

## 1. Overview

This app is a gate scanner frontend for validating ticket QR payloads.

Current implementation includes:
- Session-based login/logout via Scanner API (`POST /auth/login`, `POST /auth/logout`).
- RTK Query client with Zod-validated responses (`src/shared/api/baseApi.ts`).
- Bootstrap on load: `GET /me` → `POST /devices/register` (if needed) → `GET /assignments`.
- Camera scanning via `html5-qrcode`; manual entry uses `ticket_code` payloads.
- Live scan validation via `POST /scans` with result mapping to UI modals.
- Optional Reverb subscription on `scanner.{accountId}.scans` for cross-device scan toasts (HTTP remains canonical).
- Event selection from API assignments (`event_id`, `entry_mode` badge).
- **i18n:** English + Arabic (`i18next`), default `ar`, RTL/LTR via `html` `dir`, `Accept-Language` header on all API calls.

Not implemented yet (MVP follow-ups):
- 2FA login challenge UI.
- Offline manifest, `POST /scans/sync`, device heartbeat.

---

## 2. Route + Screen Map

Defined in `src/App.tsx`:

| Route | Access | Screen | Notes |
|---|---|---|---|
| `/login` | Public | `LoginPage` | Scanner account sign-in |
| `/forgot-password` | Public | `ForgotPasswordPage` | Step 1 — email |
| `/reset-password/verify` | Public | `ResetPasswordVerifyPage` | Step 2 — OTP |
| `/reset-password/new` | Public | `ResetPasswordNewPage` | Step 3 — new password |
| `/reset-password` | Public | Redirect | Session-aware redirect to verify or forgot |
| `/` | Protected | `ScannerPage` | Main scanner runtime |
| `*` | Any | Redirect | Redirects to `/` |

Guard behavior:
- `RequireAuth` redirects unauthenticated users to `/login`.

---

## 3. Authentication Flow (Current)

### 3.1 Session model

Redux `authSlice` + `sessionStorage` key `myticket-scanner-session-v1`:

```ts
{
  token: string
  userId: number
  email: string | null
  fullName: string | null
  deviceId: number | null
  selectedEventId: number | null
}
```

### 3.2 Login behavior

`POST /auth/login` → `bootstrapScannerSession`: `GET /me` → `POST /devices/register` (if needed) → `GET /assignments`.  
403 / non-scanner messages surface as access denied on `LoginPage`.

### 3.3 Password reset (3 steps)

Session state between steps is stored in `sessionStorage` (`passwordResetSession.ts`).

1. **Forgot password** (`/forgot-password`) — email → `POST /auth/password/forgot`
2. **Verify code** (`/reset-password/verify`) — 6-digit OTP; resend available
3. **New password** (`/reset-password/new`) — password + confirm → `POST /auth/password/reset` → redirect to login

Codes expire in **15 minutes**.

---

## 4. Scanner Runtime Flow

## 4.1 Shell

`ScannerLayout` contains:
- Header with user email.
- Event mode badge.
- Event selector (`EventPicker`).
- Logout action.

### 4.2 Scan sources

`ScannerPage` accepts scans from:
1. Camera viewfinder (`ScannerViewfinder`)
2. Manual entry dialog (`ManualEntryDialog`)

Optional **Camera off** toggle stops the viewfinder without signing out.

### 4.3 Runtime guards

- Requires selected event and registered `device_id`.
- `scanSessionLocked` from first decode until result sheet dismiss (one API call per hold).
- Camera paused/stopped while loading or showing result.

### 4.4 Camera behavior

`ScannerViewfinder`:
- Tries rear camera first: `facingMode: "environment"`.
- Falls back to front camera: `facingMode: "user"`.
- Emits permission-specific error.
- Scanner config:
  - `fps: 10`
  - Dynamic `qrbox` based on viewport dimensions.

---

## 5. Validation Logic (Live API)

Entrypoint: `POST /scans` via `useCreateScanMutation` after `parseTicketCode(raw)`.

Request: `{ event_id, ticket_code, device_id, signature? }`  
Response mapped by `mapScanLogToResult` → `success` | `failed` | `used` | `expired`.

Auto-dismiss: result dialog closes after `3200ms`.

### 5.1 Real-time cross-device sync (optional)

When `VITE_REVERB_APP_KEY` is set:

1. After bootstrap, `scannerAccountId` comes from `GET /me` (`data.id`).
2. `useScannerScanRealtime` subscribes to Echo private channel `scanner.{accountId}.scans`.
3. Listens for `.scan.recorded` — same compact row shape as organizer batch items.
4. Ignores events from this device (`device_id`) or other events (`event_id` ≠ selected).
5. Shows a toast for scans from other devices; header badge **Live sync on** when connected.

Auth: bearer token to `{API_ORIGIN}/broadcasting/auth`. Without Reverb env, HTTP-only scanning is unchanged.

**Organizer isolation (backend):** Realtime publish is skipped unless `scanner_accounts.organizer_profile_id` matches `events.organizer_id`. Cross-organizer scan attempts return HTTP `wrong_event` with `failure_reason: scanner_not_owned_by_event_organizer`. Channel auth is scoped per scanner account — only the linked scanner user may subscribe.

---

## 6. Supported QR Payload Formats

From `parseScanPayload.ts`:

1) URI format:
```txt
myticket://t/{ticketId}?s={secret}&e={eventId}
```

2) JSON format:
```json
{"ticketId":"...","secret":"...","eventId":"..."}
```

3) Plain ticket id:
```txt
tck-001
```

Helper generator:
- `buildQrPayload(ticketId, secret, eventId)`

---

## 7. Data Models (Extracted for DB Planning)

## 7.1 Core domain models

```ts
type ScanMode = "one_time" | "multi_scan"
type TicketStatus = "active" | "used" | "expired"
```

```ts
interface MockUser {
  email: string
  password: string
  isScanner: boolean
  assignedEventIds: string[]
}
```

```ts
interface MockEvent {
  id: string
  name: string
  venue: string
  endsAt: string // ISO datetime
  scanMode: ScanMode
}
```

```ts
interface MockTicket {
  id: string
  eventId: string
  holderName: string
  section: string
  seat: string
  type: string
  status: TicketStatus
  secret: string
}
```

## 7.2 Validation output models

```ts
type ScanResultKind = "success" | "failed" | "used" | "expired"
```

```ts
interface ScanSuccessDetail {
  kind: "success"
  holderName: string
  eventName: string
  venue: string
  section: string
  seat: string
  ticketType: string
}
```

```ts
interface ScanFailedDetail {
  kind: "failed"
  message: string
}
```

```ts
interface ScanUsedDetail {
  kind: "used"
  holderName: string
  eventName: string
}
```

```ts
interface ScanExpiredDetail {
  kind: "expired"
  message: string
}
```

```ts
type ScanResultDetail =
  | ScanSuccessDetail
  | ScanFailedDetail
  | ScanUsedDetail
  | ScanExpiredDetail
```

---

## 8. Integrated API Data Contracts (MVP online)

**Base URL:** `VITE_API_BASE_URL` (default `https://myticket-api.kat-jr.com/api/v1/scanner`)  
**Spec:** `SCANNER_API_ENDPOINTS.md`  
**Schemas:** `src/shared/schemas/{auth,scanner,common}.ts` (Zod + `z.infer` types)

### 8.1 Auth endpoints (wired)
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/login` | Email + password → token + user (or 2FA challenge) |
| POST | `/auth/logout` | End session |
| POST | `/auth/refresh` | Token refresh (available, not auto-polled in MVP) |

**Persistence:** `sessionStorage` key `myticket-scanner-session-v1` — token, user id/email/name, `deviceId`, `selectedEventId`.

### 8.2 Scanner ops endpoints (wired)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/me` | Active scanner account + devices |
| GET | `/assignments` | Events the scanner may work |
| POST | `/devices/register` | Register browser device once per bootstrap |
| POST | `/scans` | Validate ticket at gate |

**Scan request:** `{ event_id, ticket_code, device_id, …optional }`  
**Scan response:** `scanLogSchema` — `result`: `ok` | `duplicate` | `invalid` | `wrong_event` | `expired` + snapshot fields.

**UI mapping** (`src/features/scan/mapScanResult.ts`):
- `ok` → `success`
- `duplicate` → `used`
- `invalid`, `wrong_event` → `failed`
- `expired` → `expired`

### 8.3 QR / payload parsing
- `src/features/scan/parseTicketCode.ts` — plain `TIC-*`, JSON `{ ticket_code }`, legacy `ticketId` alias.
- Camera: `html5-qrcode` → raw string → parser → `POST /scans`.

### 8.4 Error handling
- `401` → clear auth, redirect login (`baseApi` wrapper).
- `403` / `422` / `429` → `parseApiError` messages in toasts / forms.

### 8.5 User feedback
- Toasts: `sonner`
- Haptics: `navigator.vibrate` on result state

---

## 9. Behavior Constants / Variables

- `STORAGE_KEY = "myticket-scanner-session-v1"`
- Scan session lock until result dismiss (one API call per QR hold)
- Result auto-dismiss: `3200ms`
- Camera fps: `8` (viewfinder)

---

## 10. Gaps vs Intended Production Flow

1. **2FA login** — API can return `challenge_token`; UI not built yet.

2. **Offline / sync** — No manifest download, IndexedDB queue, or `POST /scans/sync`.

3. **Device heartbeat** — `POST /devices/{id}/heartbeat` not called while foregrounded.

4. **Password recovery** — Not in scanner API (use main MyTicket app / organizer).

5. **No automatic event context switching**  
   Wrong-event scans fail via API; selected event is not auto-changed from payload.

---

## 11. Suggested DB-Oriented Entity Starter Set

For future backend schema design (based on current app data contracts):
- `users` (scanner role, credentials, active status)
- `events` (scan mode, venue, end datetime)
- `scanner_event_assignments` (many-to-many user/event)
- `tickets` (event relation, holder identity, seat, type, status, secret/hash)
- `scan_attempts` (raw payload fingerprint, result, scanner, event, timestamp, device info)
- `sessions` or token table (if server-managed auth)

This aligns directly with the current frontend models and validation outputs.
