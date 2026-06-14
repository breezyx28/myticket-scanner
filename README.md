# MyTicket Scanner

Gate scanner web app: sign-in against the Scanner API, event selection from assignments, QR camera scanning with manual entry fallback, and live ticket validation via `POST /scans`.

## Run locally

```bash
npm install
cp .env.example .env   # optional — defaults to production API URL
npm run dev
```

Open the printed local URL (default `http://localhost:5173`). **Dev and production builds both use the live API** (no mock backend).

## API configuration

```env
VITE_API_BASE_URL=https://myticket-api.kat-jr.com/api/v1/scanner
```

Default is production if unset (`src/config/env.ts`). See `SCANNER_API_ENDPOINTS.md` for contracts.

## Sign-in

Use credentials for an active **scanner** account. On success the app:

1. Stores the bearer token in `sessionStorage`
2. Calls `GET /me`, registers a device if needed, loads `GET /assignments`
3. Opens the scanner home route

Two-factor login challenges are detected but not yet implemented in the UI (toast only).

## Password reset (3 steps)

1. **Forgot password** (`/forgot-password`) — enter email
2. **Verify code** (`/reset-password/verify`) — enter 6-digit OTP
3. **New password** (`/reset-password/new`) — set password → sign in

Codes expire in **15 minutes**. Resend is available on the verify step.

## Scanning

1. Select an assigned event from the header dropdown.
2. Scan a QR code, or use **Manual entry** with a `ticket_code` (e.g. `TIC-…`) or JSON `{"ticket_code":"TIC-…"}`.
3. Results come from `POST /scans` (valid, duplicate, invalid, expired, etc.).

Use **Camera off** to stop the viewfinder; turn it back on when ready to scan again.

## Real-time sync (optional)

When Reverb env vars are set, the scanner subscribes to `private-scanner.{accountId}.scans` for cross-device awareness. **HTTP `POST /scans` remains the source of truth** for scans on this device.

```env
VITE_REVERB_APP_KEY=…
VITE_REVERB_HOST=myticket-api.kat-jr.com
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

Scans from other devices on the same account show as a toast; the header shows **Live sync on** when connected. Without Reverb config, scanning works as before over HTTP only.

## Scripts

- `npm run dev` — Vite dev server (live API)
- `npm run build` — Typecheck + production build
- `npm run lint` — ESLint
- `npm run preview` — Preview production build

## Stack

Vite 7, React 19, TypeScript, Redux Toolkit + RTK Query, Zod, react-hook-form, Tailwind CSS v4, Radix primitives, `html5-qrcode`, Laravel Echo + Reverb (optional), Fontsource, React Router 7.
