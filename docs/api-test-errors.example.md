# API Test Error Report (example)

> This file is auto-generated when you run `npm run test:api`.  
> Copy this template to understand the format; the live report is written to `docs/api-test-errors.md` (gitignored).

---

| Field | Value |
|-------|-------|
| Suite | integration |
| Started | 2026-01-01T00:00:00.000Z |
| API base | https://myticket-api.kat-jr.com/api/v1/scanner |
| Credentials configured | yes |
| Real ticket test enabled | no |

---

### FAIL: auth API > POST /auth/login succeeds with valid credentials and matches schema

- **Suite:** integration
- **File:** tests/integration/auth.test.ts
- **HTTP status:** 422

**Message:**

```
Login failed (422): {"message":"..."}
```

**Response body:**

```json
{
  "message": "The given data was invalid."
}
```

---

## Summary (integration)

| Passed | Failed | Skipped |
|--------|--------|---------|
| 12 | 1 | 0 |
