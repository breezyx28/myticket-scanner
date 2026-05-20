# Scanner App API — Endpoints & Response Schemas

**Base URL:** `https://<host>/api/v1/scanner`  
**Route file:** `routes/api_scanner.php`  
**Global prefix / name:** `api/v1/scanner` · `api.v1.scanner.*`

Production example: `https://myticket-api.kat-jr.com/api/v1/scanner`

---

## Authentication

| Requirement | Value |
|-------------|--------|
| Protected routes | `Authorization: Bearer <token>` |
| Sanctum ability | **`app:scanner`** |
| Middleware | `auth:sanctum`, `app.scope:scanner` |
| Login roles allowed | `users.role` **`scanner`** or **`admin`** |
| Account gate | User must have an active **`scanner_accounts`** row (`is_active = true`) for `/me`, scans, devices, etc. |

**Content-Type:** All request bodies documented below use **`application/json`**. This API does **not** use `multipart/form-data` on any scanner route.

---

## Shared response shapes

### Success

| Pattern | HTTP | Body |
|---------|------|------|
| `{ data: … }` | 200 / 201 | Single resource or array |
| Top-level auth object | 200 | Login / OAuth (no `data` wrapper) |
| `{ message: "…" }` | 200 | Logout |

### Failure

| Code | When |
|------|------|
| **401** | Missing/invalid bearer token |
| **403** | Wrong app scope, scanner not assigned to event (manifest), role denied on login |
| **404** | Unknown device id, no `scanner_accounts` for user |
| **409** | (Not used on scanner routes; seat locking is on **main** API) |
| **422** | Validation errors, invalid credentials |
| **429** | `auth-login` throttle on login routes |

### Validation error (422)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "event_id": ["The event id field is required."]
  }
}
```

### Simple abort (403 / 404 / 422)

```json
{
  "message": "Scanner is not assigned to this event."
}
```

---

## Public — health & version

### `GET /health`

**Auth:** none  

**Response 200:**

```json
{
  "app": "scanner",
  "status": "ok",
  "version": "v1",
  "time": "2026-05-20T12:00:00+00:00"
}
```

---

### `GET /version`

**Auth:** none  

**Response 200:**

```json
{
  "app": "scanner",
  "api_version": "v1",
  "phase": "phase-1-migrations"
}
```

---

## Auth (no token unless noted)

### `POST /auth/login`

**Auth:** none · **Throttle:** `auth-login`  

**Request body (JSON):**

| Field | Type | Required | Rules |
|-------|------|----------|--------|
| `email` | string | One of `email` / `phone` | Valid email when present |
| `phone` | string | One of `email` / `phone` | Max 20 |
| `password` | string | **Yes** | — |
| `otp` | string | No | Required when user has 2FA enabled |

**Response 200 — success:**

```json
{
  "token": "1|plainTextSanctumToken…",
  "refresh_token": null,
  "expires_at": "2026-05-21T12:00:00+00:00",
  "user": {
    "id": 19,
    "email": "scanner@example.com",
    "full_name": "Gate Staff",
    "role": "scanner"
  }
}
```

**Response 200 — 2FA challenge (no token yet):**

```json
{
  "challenge_token": "ch_…",
  "two_factor_required": true
}
```

**Response 422:** Invalid credentials.

**Response 403:** Role not allowed for scanner app.

---

### `POST /auth/oauth/{provider}/callback`

**Auth:** none · **Throttle:** `auth-login`  

`{provider}` — driver resolved by OAuth config (e.g. `google`).

**Request body (JSON):** Depends on Socialite / provider (typically `code`, `state`, or token fields from the OAuth redirect). Not validated in a dedicated FormRequest; payload is read by the OAuth driver.

**Response 200:** Same shape as login success (`token`, `expires_at`, `user`).

---

### `POST /auth/logout`

**Auth:** bearer + `app:scanner`  

**Request body:** optional empty JSON `{}`

**Response 200:**

```json
{
  "message": "Logged out."
}
```

---

### `POST /auth/refresh`

**Auth:** bearer + `app:scanner`  

**Request body:** optional empty JSON `{}`

**Response 200:**

```json
{
  "token": "2|newPlainTextSanctumToken…"
}
```

Revokes the current token and issues a new one.

---

## Scanner operations (authenticated)

### `GET /me`

**Auth:** bearer + `app:scanner` + active `scanner_accounts` row  

**Request body:** none  

**Response 200:**

```json
{
  "data": {
    "id": 1,
    "code": "SCN-ACCT-1",
    "organizer_profile_id": 1,
    "user_id": 19,
    "name": "Door Scanner",
    "email": "scanner@example.com",
    "password_hash": null,
    "is_active": true,
    "last_login_at": null,
    "created_at": "2026-05-17T10:00:00.000000Z",
    "updated_at": "2026-05-17T10:00:00.000000Z",
    "deleted_at": null,
    "assignments": [
      {
        "id": 1,
        "scanner_account_id": 1,
        "event_id": 18,
        "assigned_by": 2,
        "assigned_at": "2026-05-17T10:00:00.000000Z",
        "revoked_at": null,
        "event": { }
      }
    ],
    "devices": [
      {
        "id": 3,
        "scanner_account_id": 1,
        "device_label": "Gate 1",
        "device_token_hash": "64-char-sha256-hex…",
        "user_agent": "ScannerApp/1.0",
        "last_seen_at": "2026-05-20T12:00:00.000000Z",
        "is_active": true,
        "revoked_at": null,
        "created_at": "…",
        "updated_at": "…"
      }
    ]
  }
}
```

`assignments[].event` and nested models use Laravel `toArray()` (snake_case relation keys, full event columns).

**Response 404:** No active scanner account for this user.

---

### `POST /devices/register`

**Auth:** bearer + `app:scanner`  

**Request body (JSON):**

| Field | Type | Required | Rules |
|-------|------|----------|--------|
| `device_label` | string | No | Max 160 |
| `device_token` | string | No | Max 255; stored as SHA-256 hash server-side |
| `user_agent` | string | No | Max 500 |

**Response 201:**

```json
{
  "data": {
    "id": 4,
    "scanner_account_id": 1,
    "device_label": "iPad Gate A",
    "device_token_hash": "…",
    "user_agent": "ScannerApp/1.0 (iOS)",
    "last_seen_at": "2026-05-20T12:00:00.000000Z",
    "is_active": true,
    "revoked_at": null,
    "created_at": "…",
    "updated_at": "…"
  }
}
```

**Note:** Plaintext `device_token` is never returned; only `device_token_hash`.

---

### `POST /devices/{id}/heartbeat`

**Auth:** bearer + `app:scanner`  

**Path:** `id` — scanner device id (must belong to the caller’s account).

**Request body (JSON):** none required (empty `{}` is fine).

**Response 200:**

```json
{
  "data": {
    "id": 4,
    "scanner_account_id": 1,
    "device_label": "iPad Gate A",
    "device_token_hash": "…",
    "user_agent": "…",
    "last_seen_at": "2026-05-20T12:15:00.000000Z",
    "is_active": true,
    "revoked_at": null,
    "created_at": "…",
    "updated_at": "…"
  }
}
```

Updates `last_seen_at` to now.

---

### `GET /assignments`

**Auth:** bearer + `app:scanner`  

**Request body:** none  

**Response 200:**

```json
{
  "data": [
    {
      "id": 1,
      "scanner_account_id": 1,
      "event_id": 18,
      "assigned_by": 2,
      "assigned_at": "2026-05-17T10:00:00.000000Z",
      "revoked_at": null,
      "event": {
        "id": 18,
        "code": "EVT-00000016",
        "title": "test",
        "starts_at": "2026-05-27T11:43:00.000000Z",
        "ends_at": "2026-05-31T14:48:00.000000Z",
        "status": "published",
        "entry_mode": "one_time"
      }
    }
  ]
}
```

Only assignments with `revoked_at = null`.

---

### `GET /events/{id}/manifest`

**Auth:** bearer + `app:scanner`  

**Path:** `id` — **event id** (integer), not event code.

**Request body:** none  

**Response 200:**

```json
{
  "data": {
    "event_id": 18,
    "tickets": [
      {
        "code": "TIC-6ZAZYTFABRQBUX",
        "ticket_id": 42,
        "holder_hash": "sha256-hex-of-holder-user-id"
      }
    ],
    "manifest_hash": "sha256-hex-of-pipe-joined-ticket-codes"
  }
}
```

**Ticket filter:** `status` in `active`, `gifted` only.

**Response 403:** Scanner not assigned to this event.

---

### `POST /scans`

**Auth:** bearer + `app:scanner`  

**Request body (JSON):**

| Field | Type | Required | Rules |
|-------|------|----------|--------|
| `event_id` | integer | **Yes** | Must exist; scanner must be assigned |
| `ticket_code` | string | **Yes** | Max 80 (ticket `code`, QR payload ref) |
| `device_id` | integer | **Yes** | Must belong to caller’s scanner account |
| `occurrence_id` | integer | No | Stored on scan log |
| `scanned_at` | string (datetime) | No | ISO/local parseable date; defaults to now |
| `signature` | string | No | Hashed into `raw_payload_hash` |
| `offline_client_id` | string | No | Max 80; client idempotency key for offline |

**Response 201:**

```json
{
  "data": {
    "id": 101,
    "scanner_account_id": 1,
    "scanner_device_id": 3,
    "event_id": 18,
    "occurrence_id": null,
    "ticket_id": 42,
    "ticket_ref": "TIC-6ZAZYTFABRQBUX",
    "holder_name_snapshot": null,
    "seat_label_snapshot": "A-12",
    "ticket_type_snapshot": "VIP",
    "raw_payload_hash": "64-char-hex…",
    "result": "ok",
    "failure_reason": null,
    "scan_mode": "one_time",
    "scanned_at": "2026-05-20T12:15:35.000000Z",
    "offline_client_id": null,
    "offline_synced_at": null,
    "created_at": "2026-05-20T12:15:35.000000Z"
  }
}
```

#### `result` enum

| Value | Meaning |
|-------|---------|
| `ok` | Valid scan; for `entry_mode !== multi_scan`, ticket → `used` |
| `duplicate` | Already scanned successfully on this event (`one_time` events) |
| `invalid` | Ticket not found or bad status |
| `expired` | Outside event window (±4h grace vs `starts_at` / `ends_at`) |
| `wrong_event` | Ticket belongs to another event or scanner not assigned |

#### `failure_reason` (when not `ok`)

| Value | When |
|-------|------|
| `scanner_not_assigned` | No active assignment for this event |
| `ticket_not_found` | No ticket with `ticket_code` |
| `ticket_from_other_event` | Ticket `event_id` mismatch |
| `before_window` | Too early |
| `after_window` | Too late |
| `already_scanned` | Prior `ok` scan for same ticket/event |
| `ticket_status_invalid` | Status not `active` or `gifted` |

**Side effect on `ok`:** Ticket `status` → `used`, `used_at` set (unless event `entry_mode` is `multi_scan`).

---

### `POST /scans/sync`

**Auth:** bearer + `app:scanner`  

Bulk upload of offline scans. Each item is processed like `POST /scans` (with `offline_synced_at` set server-side).

**Request body (JSON):**

| Field | Type | Required | Rules |
|-------|------|----------|--------|
| `scans` | array | **Yes** | Min 1 item |

**Each element of `scans[]`:**

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `event_id` | integer | **Yes** | Same as single scan |
| `ticket_code` | string | **Yes** | Same as single scan |
| `device_id` | integer | **Yes** | Same as single scan |
| `occurrence_id` | integer | No | Optional |
| `scanned_at` | string (datetime) | No | Used for deduplication |
| `signature` | string | No | Optional |
| `offline_client_id` | string | No | Optional |

**Response 200:**

```json
{
  "data": [
    {
      "id": 102,
      "scanner_account_id": 1,
      "scanner_device_id": 3,
      "event_id": 18,
      "ticket_ref": "TIC-…",
      "result": "ok",
      "failure_reason": null,
      "scanned_at": "2026-05-20T11:00:00.000000Z",
      "offline_client_id": "off-1",
      "offline_synced_at": "2026-05-20T12:20:00.000000Z"
    },
    {
      "result": "duplicate_sync"
    }
  ]
}
```

**Deduplication:** If a log already exists for the same `scanner_account_id`, `scanner_device_id`, `ticket_ref`, and `scanned_at`, the entry is **`{ "result": "duplicate_sync" }`** (not a full scan log row).

Otherwise each item is a full **ScanLog** object (same schema as `POST /scans` **data**).

---

## Recommended client flow

1. `POST /auth/login` → store `token`.
2. `GET /me` or `GET /assignments` → pick event.
3. `POST /devices/register` → store `device_id` for scans.
4. `GET /events/{eventId}/manifest` → cache for offline validation.
5. `POST /scans` per QR read (online), or queue and `POST /scans/sync` on reconnect.
6. `POST /devices/{id}/heartbeat` periodically while app is foregrounded.

---

## Related APIs (not under `/scanner`)

Organizers manage scanners and view logs on the **organizer** API:

| Method | Path |
|--------|------|
| GET | `/api/v1/organizer/scanners` |
| POST | `/api/v1/organizer/scanners` |
| POST | `/api/v1/organizer/scanners/{id}/assignments` |
| DELETE | `/api/v1/organizer/scanners/{id}/assignments/{assignmentId}` |
| POST | `/api/v1/organizer/scanners/{id}/devices/{deviceId}/revoke` |
| GET | `/api/v1/organizer/events/{id}/scan-logs` |

See [`docs/ORGANIZER_API_ENDPOINTS.md`](ORGANIZER_API_ENDPOINTS.md) for those schemas.

---

## OpenAPI / Scribe

Generated artifact: `storage/api-docs/scanner.json` (via `composer openapi:generate`).
