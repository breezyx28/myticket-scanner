# MyTicket — Scanner App Flow

> **Type:** Scanner App (Minimal Standalone)  
> **URL:** `scanner.myticket.com`  
> **Users:** Event Scanner only  
> **Shared Flows:** See `myticket_shared_flow.md` for authentication and localization  
> **Master Reference:** `myticket_platform_flow.md`  
> **Last Updated:** April 2026

---

## 1. Overview

The Scanner App is a minimal, browser-based standalone application used by Event Scanners at event entrances. Its sole purpose is to scan QR codes on attendee tickets and display the validation result. Scanner accounts are created and managed by Organizers from the Organizer Dashboard — they are not self-registered.

---

## 2. Authentication

The Scanner App has its own login page. **Registration and password reset are not available** on this app — Scanner accounts are created by Organizers, who provide the scanner's email and initial credentials.

### Login Page

- Email/password login only (no Google Social Login).
- Only Scanner accounts can log in. Non-scanner credentials are rejected with an access denied message.
- See `myticket_shared_flow.md` Section 3.6 for login flow details.

### Forgot Password / Reset Password

- Available on the login page.
- See `myticket_shared_flow.md` Section 3.7 for the full password reset flow.

### Account Management

- Scanner accounts are created, updated, and deleted by the **Organizer** from the Organizer Dashboard (see `myticket_organizer_dashboard_flow.md` Section 6).
- A Scanner can be assigned to **multiple events** simultaneously by the Organizer.
- The Scanner has no ability to modify their own account from this app.

---

## 3. Scanner Interface

After logging in, the Scanner sees a minimal interface optimized for speed and reliability at event gates.

### Main View

- The primary screen is a **camera viewfinder** for scanning QR codes.
- The browser requests **camera access** on first use.
- The Scanner points the camera at an attendee's QR code (displayed on phone screen or printed PDF).
- The system processes the scan and displays the result immediately on screen.

### Event Context

- If the Scanner is assigned to **multiple events**, the app may display an event selector or automatically detect the event from the QR code's `eventId`.
- The Scanner only processes tickets for events they are assigned to.

---

## 4. QR Validation Logic

When a QR code is scanned, the system validates it against the backend:

### One-Time Entry Mode (default)

| Result | Display | Action |
|---|---|---|
| **Succeeded** | Green confirmation with ticket holder name, seat info, ticket type | Ticket status set to USED atomically — entry granted |
| **Failed** | Red error — hash mismatch or ticket not found | Entry denied |
| **Used** | Orange warning — ticket already scanned/used | Entry denied (duplicate entry attempt) |
| **Expired** | Gray notice — event has ended | Entry denied |

### Multi-Scan Mode

| Result | Display | Action |
|---|---|---|
| **Succeeded** | Green confirmation with ticket holder name, seat info, ticket type | Ticket remains ACTIVE — entry granted, can be scanned again for re-entry |
| **Failed** | Red error — hash mismatch or ticket not found | Entry denied |
| **Expired** | Gray notice — event has ended | Entry denied (ticket automatically set to USED/EXPIRED when event concludes) |

### Validation Details

- **Atomic update** ensures no duplicate entry is possible in one-time mode (race-condition safe).
- In multi-scan mode, each scan is **logged** for attendance tracking (visible in the Organizer Dashboard).
- The scan result screen shows enough detail for the Scanner to verify the attendee: ticket holder name, event name, seat information, and ticket type.

---

## 5. Scanner Capabilities

The Scanner App is intentionally minimal. The Scanner has **no other platform capabilities**:

- No access to event management, booking data, or analytics.
- No access to the Marketplace, profiles, or support.
- No ability to create, edit, or delete events.
- The Scanner can only: log in, scan QR codes, and view scan results.
