# MyTicket Scanner

Gate scanner web app: sign-in against the production Scanner API, event selection from assignments, QR camera scanning (with simulate / manual entry), and live ticket validation via `POST /scans`.

## Run locally

```bash
npm install
cp .env.example .env   # optional — defaults to production API URL
npm run dev
```

Open the printed local URL (default `http://localhost:5173`).

## API configuration

Set the Scanner API base URL (see `SCANNER_API_ENDPOINTS.md`):

```env
VITE_API_BASE_URL=https://myticket-api.kat-jr.com/api/v1/scanner
```

Default is production if the variable is unset (`src/config/env.ts`).

## Sign-in

Use credentials for an active **scanner** account on the MyTicket API. On success the app:

1. Stores the bearer token in `sessionStorage`
2. Calls `GET /me`, registers a device if needed, loads `GET /assignments`
3. Redirects to the scanner home route

Two-factor login challenges are detected but not yet implemented in the UI (toast only).

## Scanning

1. Select an assigned event from the header dropdown.
2. Scan a QR code or use **Manual entry** / **Simulate scan** with a `ticket_code` (e.g. `TIC-…`) or JSON `{"ticket_code":"TIC-…"}`.
3. Results come from `POST /scans` and map to success / already used / invalid / expired modals.

## Password reset (no API)

Forgot/reset password screens are **UI-only** — there is no scanner API for password recovery in the MVP. They remain for layout reference.

## Mock data (`src/mocks/`)

Legacy mock users, events, and in-memory `validateScan` are kept for reference only and are **not** imported by the production app path.

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — Typecheck + production build
- `npm run lint` — ESLint
- `npm run preview` — Preview production build

## Stack

Vite 7, React 19, TypeScript, Redux Toolkit + RTK Query, Zod, react-hook-form, Tailwind CSS v4, Radix primitives, `html5-qrcode`, Fontsource, React Router 7.
