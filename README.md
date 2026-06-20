# MyTicket Scanner

Gate scanner web app: sign-in against the Scanner API, event selection from assignments, QR camera scanning with manual entry fallback, and live ticket validation via `POST /scans`.

## Localization

Default language is **Arabic** (`ar`). Use the language switcher in the auth header or scanner toolbar to change language.

- UI strings: `i18next` + `react-i18next` (`src/i18n/locales/en.json`, `ar.json`)
- Direction: `dir="rtl"` for Arabic, `dir="ltr"` for English (set on `<html>`)
- API: every request sends `Accept-Language: ar` or `Accept-Language: en` via RTK Query and Echo auth

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
- `npm run build:android` — Web build + `cap sync android`
- `npm run open:android` — Open Android Studio
- `npm run apk:release` — Build signed release APK + `releases/manifest.json` (requires keystore)

## Web vs Android

The same React codebase runs in the browser and in a Capacitor Android WebView.

| Runtime | Session storage | Camera | Biometric login |
|---------|-----------------|--------|-----------------|
| Web browser | `sessionStorage` | `html5-qrcode` | Not available |
| Android app | Secure storage + Preferences | ML Kit barcode | Fingerprint after first password login |
| Android mobile web | `sessionStorage` | `html5-qrcode` | Install prompt → self-hosted APK |

Web routes, layouts, and flows are unchanged. Native-only behavior is gated with `Capacitor.isNativePlatform()`.

### Android development

```bash
npm install
npm run build:android
npm run open:android
```

Run on a device or emulator from Android Studio. Debug builds use the debug keystore automatically.

**SDK path:** Gradle needs `android/local.properties` with `sdk.dir` pointing at your Android SDK (usually `C:\Users\<you>\AppData\Local\Android\Sdk` on Windows). Copy `android/local.properties.example` if missing. This file is gitignored.

### Release APK (local)

**App branding:** Source icons live in `assets/icon-only.png` and `assets/splash.png`. Regenerate Android mipmaps with `npm run assets:generate` after changing them.

1. Generate a release keystore (once — **back up the `.jks` file and passwords**):

   ```bash
   keytool -genkeypair -v -keystore android/myticket-scanner-release.jks \
     -alias myticket-scanner -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Copy `android/keystore.properties.example` → `android/keystore.properties` and fill in paths/passwords.

3. Build:

   ```bash
   npm run apk:release
   ```

Output:

- `releases/scanner-latest.apk` — sideload / install prompt target
- `releases/scanner-{version}.apk` — versioned archive
- `releases/manifest.json` — name, package id, version, icon URL, SHA-256, release timestamp
- `releases/icon-512.png` — install prompt / web icon

### CI / VPS deploy

When GitHub Actions secrets are set (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`), the deploy workflow builds a signed APK and rsyncs `dist/` plus `releases/` to the VPS. Mobile web users get an install dialog linking to `/releases/scanner-latest.apk` on the same origin.

### Venue install (sideload)

1. Open the scanner site on Android Chrome (or download the APK from `/releases/scanner-latest.apk`).
2. Allow “Install unknown apps” for the browser or file manager if prompted.
3. Install and open **MyTicket Scanner**.
4. Sign in with password once; enable fingerprint unlock on subsequent launches.

## Stack

Vite 7, React 19, TypeScript, Redux Toolkit + RTK Query, Zod, i18next, react-hook-form, Tailwind CSS v4, Radix primitives, `html5-qrcode`, Capacitor 8 (Android), Laravel Echo + Reverb (optional), Fontsource, React Router 7.
