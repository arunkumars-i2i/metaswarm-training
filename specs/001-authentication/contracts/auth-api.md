# REST API Contracts: Authentication

Base path: `/api/auth`. All requests/responses are JSON. Errors use a consistent shape:

```json
{ "error": { "code": "string", "message": "string", "details": [] } }
```

- `400 VALIDATION_ERROR` — input failed validation (invalid email format, missing password).
  `details` lists field errors.
- `401 INVALID_CREDENTIALS` — authentication failed (login). Generic; never reveals which field.
- `401 UNAUTHORIZED` — missing/invalid/expired token on a protected request.
- `429 RATE_LIMITED` — too many login attempts.

---

## POST /api/auth/login

Authenticate a user and issue a session token.

**Request body**

```json
{ "email": "rep@example.com", "password": "s3cret-pass" }
```

- `email` — required, valid email format (normalized: trimmed, lower-cased). (FR-002, FR-011)
- `password` — required, non-empty string. (FR-003)

**Responses**

- `200 OK` — credentials valid (FR-004, FR-005):

  ```json
  {
    "token": "<jwt>",
    "user": { "id": "ckxq...", "email": "rep@example.com" }
  }
  ```

  Never includes `passwordHash`. (FR-006, SC-004)

- `400 VALIDATION_ERROR` — malformed email or missing password (SC-007).
- `401 INVALID_CREDENTIALS` — unknown email, wrong password, or disabled account. Identical
  body for all three (FR-007, SC-003):

  ```json
  { "error": { "code": "INVALID_CREDENTIALS", "message": "Invalid email or password." } }
  ```

- `429 RATE_LIMITED` — brute-force throttle tripped (FR-012).

---

## POST /api/auth/logout

End the current session.

**Request**: requires `Authorization: Bearer <token>`. No body.

**Responses**

- `204 No Content` — session ended; client MUST discard its token (FR-008). Subsequent use of
  the discarded token by the client is prevented client-side; see research.md for the
  stateless-logout trade-off.
- `401 UNAUTHORIZED` — no/invalid token.

---

## GET /api/auth/me

Return the authenticated user's basic profile; used to gate protected routes (US3).

**Request**: requires `Authorization: Bearer <token>`. No body.

**Responses**

- `200 OK`:

  ```json
  { "user": { "id": "ckxq...", "email": "rep@example.com" } }
  ```

- `401 UNAUTHORIZED` — missing, invalid, tampered, or expired token (FR-009, FR-010).

---

## Protected resources (cross-cutting)

All non-auth CRM endpoints MUST require a valid `Authorization: Bearer <token>` and return
`401 UNAUTHORIZED` when it is absent or invalid (FR-009). This is enforced by shared
authentication middleware, not per-endpoint logic.

## Performance

Every endpoint MUST respond in < 500ms under expected load (constitution Principle V); login
result reaches the user in < 1s (SC-002).
