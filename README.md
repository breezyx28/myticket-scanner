# MyTicket Scanner (frontend mockup)

Minimal scanner web app: sign-in, event selection, QR camera scanning (with simulate / manual entry), and in-memory ticket validation aligned with `myticket_scanner_flow.md` and the MyTicket design tokens.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`).

## Demo accounts

| Email | Password | Notes |
| --- | --- | --- |
| `scanner@demo.com` | `scanner123` | Scanner account — use for the full flow |
| `organizer@demo.com` | `organizer123` | **Not** a scanner — shows “access denied” |

## Password reset (mock)

1. From login, use **Forgot password?**
2. Submit any email, then open **Open demo reset link**
3. Or go directly to `/reset-password?token=demo`  
   Completing the form only shows a success toast — it does **not** change the demo passwords above.

## Sample QR strings (paste into “Manual entry” or use **Simulate scan**)

Payload format: `myticket://t/{ticketId}?s={secret}&e={eventId}`

- **Valid VIP (Summer Jazz, one-time):**  
  `myticket://t/tck-001?s=alpha&e=evt-summer-jazz`  
  Select event **Summer Jazz Night** before scanning.

- **Already used (Summer Jazz):**  
  `myticket://t/tck-002?s=bravo&e=evt-summer-jazz`

- **Multi-scan (Indie Open Air):**  
  `myticket://t/tck-003?s=charlie&e=evt-indie-fest`  
  Select **Indie Open Air** — can be “scanned” repeatedly; ticket stays active.

- **Expired ticket:**  
  `myticket://t/tck-expired?s=delta&e=evt-indie-fest`

- **Wrong secret:**  
  `myticket://t/tck-001?s=wrong&e=evt-summer-jazz`

Plain ticket id (secret not sent): `tck-001` — still validates when the correct event is selected.

## Scripts

- `npm run dev` — Vite dev server  
- `npm run build` — Typecheck + production build  
- `npm run lint` — ESLint  
- `npm run preview` — Preview production build  

## Stack

Vite 7, React 19, TypeScript, Tailwind CSS v4, Radix primitives (dialog, select, label, slot), `html5-qrcode`, Fontsource (Plus Jakarta Sans, Space Grotesk), React Router 7.
