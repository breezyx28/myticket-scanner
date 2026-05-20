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
- Camera scanning via `html5-qrcode`; manual / simulate entry uses `ticket_code` payloads.
- Live scan validation via `POST /scans` with result mapping to UI modals.
- Event selection from API assignments (`event_id`, `entry_mode` badge).

Not implemented yet (MVP follow-ups):
- 2FA login challenge UI.
- Offline manifest, `POST /scans/sync`, device heartbeat.
- Forgot/reset password (scanner API) — pages are mock UI only.

---

## 2. Route + Screen Map

Defined in `src/App.tsx`:

| Route | Access | Screen | Notes |
|---|---|---|---|
| `/login` | Public | `LoginPage` | Prefilled demo credentials for quick entry |
| `/forgot-password` | Public | `ForgotPasswordPage` | Mock-only flow |
| `/reset-password` | Public | `ResetPasswordPage` | Requires `?token=demo` |
| `/` | Protected | `ScannerPage` | Main scanner runtime |
| `*` | Any | Redirect | Redirects to `/` |

Guard behavior:
- `RequireAuth` redirects unauthenticated users to `/login`.

---

## 3. Authentication Flow (Current)

### 3.1 Session model

Stored in `sessionStorage` key:
- `myticket-scanner-session-v1`

Session payload:
```ts
{
  email: string
  selectedEventId: string
}
```

### 3.2 Login behavior

`AuthContext.login(email, password)`:
- Looks up user in local `MOCK_USERS`.
- Validates credentials.
- Sets active user + selected default event.
- Persists session payload.

Current login result type:
```ts
type LoginFailureReason = "invalid_credentials" | "not_scanner"
type LoginResult = { ok: true } | { ok: false; reason: LoginFailureReason }
```

### 3.3 Important implementation note

UI supports an access-denied state for non-scanner accounts, but current `AuthContext.login()` does not enforce `isScanner` role rejection yet. This should be fixed before production.

### 3.4 Password reset

Implemented as mock UX only:
- `/forgot-password`: success message + demo reset link.
- `/reset-password?token=demo`: form validation + toast, no real password update.

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
2. Simulated payload dialog (`SimulateScanDialog`)
3. Manual entry dialog (`ManualEntryDialog`)

### 4.3 Runtime guards

- Requires selected event before validation.
- Deduplicates same payload in a `1800ms` window.
- Uses in-flight lock to prevent concurrent validations.
- Pauses camera while loading/result modal is open.

### 4.4 Camera behavior

`ScannerViewfinder`:
- Tries rear camera first: `facingMode: "environment"`.
- Falls back to front camera: `facingMode: "user"`.
- Emits permission-specific error.
- Scanner config:
  - `fps: 10`
  - Dynamic `qrbox` based on viewport dimensions.

---

## 5. Validation Logic (Current Implementation)

Validation entrypoint:
- `validateScan(raw: string, selectedEventId: string): Promise<ScanResultDetail>`

Processing delay:
- Random `300–799ms` to simulate network/processing.

Validation checks:
1. Parse payload.
2. Ensure ticket exists.
3. Validate secret when provided.
4. Validate payload event consistency when provided.
5. Ensure ticket event equals selected event.
6. Check ticket/event expiration.
7. Apply mode-specific behavior.

Result union:
- `success`
- `failed`
- `used`
- `expired`

Auto-dismiss:
- Result dialog closes after `3200ms`.

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

### 8.6 Legacy mocks (`src/mocks/`)
Reference-only; not used at runtime. See section 9 for historical seed shapes.

---

## 9. Legacy Mock Seed Data (reference only)

### Users
- `scanner@demo.com` / `scanner123` (scanner user)
- `organizer@demo.com` / `organizer123` (non-scanner mock user)

### Events
- `evt-summer-jazz` (`one_time`)
- `evt-indie-fest` (`multi_scan`)

### Tickets
- Includes active, used, and expired examples:
  - `tck-001`, `tck-002`, `tck-003`, `tck-expired`

---

## 10. Behavior Constants / Variables

- `STORAGE_KEY = "myticket-scanner-session-v1"`
- `DEMO_SCANNER_EMAIL = "scanner@demo.com"`
- `DEMO_SCANNER_PASSWORD = "scanner123"`
- Scan dedupe window: `1800ms`
- Validation delay: `300–799ms`
- Result auto-dismiss: `3200ms`
- Camera fps: `10`
- Reset token: `demo`
- Reset password min length: `6`

---

## 11. Gaps vs Intended Production Flow

1. **2FA login** — API can return `challenge_token`; UI not built yet.

2. **Offline / sync** — No manifest download, IndexedDB queue, or `POST /scans/sync`.

3. **Device heartbeat** — `POST /devices/{id}/heartbeat` not called while foregrounded.

4. **Password recovery** — Forgot/reset pages are mock-only (no scanner API).

5. **No automatic event context switching**  
   Wrong-event scans fail via API; selected event is not auto-changed from payload.

---

## 12. Suggested DB-Oriented Entity Starter Set

For future backend schema design (based on current app data contracts):
- `users` (scanner role, credentials, active status)
- `events` (scan mode, venue, end datetime)
- `scanner_event_assignments` (many-to-many user/event)
- `tickets` (event relation, holder identity, seat, type, status, secret/hash)
- `scan_attempts` (raw payload fingerprint, result, scanner, event, timestamp, device info)
- `sessions` or token table (if server-managed auth)

This aligns directly with the current frontend models and validation outputs.
