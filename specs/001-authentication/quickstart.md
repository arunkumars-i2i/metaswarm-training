# Quickstart & Validation: Authentication

A runnable guide to prove the Authentication feature works end-to-end. Implementation details
(model/service/middleware bodies, migrations, full test suites) belong in `tasks.md` and the
implementation phase — this document validates behavior. See [data-model.md](./data-model.md)
and [contracts/auth-api.md](./contracts/auth-api.md) for specifics.

## Prerequisites

- Node.js 20 LTS and a running PostgreSQL instance (local or container).
- Backend env vars set (never commit secrets — constitution Principle IV):
  - `DATABASE_URL` — PostgreSQL connection string
  - `JWT_SECRET` — strong random secret for signing tokens
  - `JWT_EXPIRES_IN` — token lifetime (default `24h`)
- At least one seeded user (account creation is out of scope; seed a test user with a known
  password whose hash is stored via bcrypt).

## Setup

```bash
# Backend
cd backend
npm install
npx prisma migrate dev          # apply schema (User table)
npm run seed                    # create a known test user (e.g. rep@example.com)
npm run dev                     # start API (default http://localhost:3000)

# Frontend (separate terminal)
cd frontend
npm install
npm run dev                     # start SPA (default http://localhost:5173)
```

## Automated test validation (TDD — run first, expect red before implementation)

```bash
# Backend unit + integration (Vitest + Supertest against a test database)
cd backend && npm test

# Frontend component/integration (Vitest + React Testing Library)
cd frontend && npm test
```

Per constitution Principle I, these tests are written and failing before implementation, then
pass once the feature is built.

## Manual API validation

Map each step to its acceptance criterion.

1. **Successful login (US1 #1, FR-004/FR-005)**

   ```bash
   curl -s -X POST http://localhost:3000/api/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"email":"rep@example.com","password":"<known-password>"}'
   ```

   Expect `200` with `{ "token": "...", "user": { "id": "...", "email": "rep@example.com" } }`
   and **no** `passwordHash` (SC-004).

2. **Wrong password (US1 #2, FR-007/SC-003)** — same request with a bad password → `401` with
   `{"error":{"code":"INVALID_CREDENTIALS","message":"Invalid email or password."}}`.

3. **Unknown email (US1 #3)** — login with an unregistered email → identical `401` body as step 2.

4. **Malformed email (US1 #4, FR-002/SC-007)** — `"email":"not-an-email"` → `400 VALIDATION_ERROR`.

5. **Missing password (US1 #5, FR-003)** — omit `password` → `400 VALIDATION_ERROR`.

6. **Access protected resource with token (US3)**

   ```bash
   curl -s http://localhost:3000/api/auth/me -H "Authorization: Bearer <token-from-step-1>"
   ```

   Expect `200` with the current user.

7. **No token (US3 #1, FR-009)** — call `/api/auth/me` with no header → `401 UNAUTHORIZED`.

8. **Tampered/expired token (US3 #2, FR-010)** — alter a character in the token or use an
   expired one → `401 UNAUTHORIZED`.

9. **Logout (US2, FR-008)**

   ```bash
   curl -s -i -X POST http://localhost:3000/api/auth/logout \
     -H "Authorization: Bearer <token-from-step-1>"
   ```

   Expect `204`. The client then discards the token; subsequent app navigation to protected
   pages returns the user to login (US2 #2).

10. **Brute-force throttle (FR-012)** — rapidly repeat step 2 beyond the configured limit →
    `429 RATE_LIMITED`.

## Manual UI validation (WCAG 2.1 AA — Principle V)

- Navigate to the login page; confirm the route is lazy-loaded (separate chunk in network tab).
- Submit valid credentials → land in the CRM; submit invalid → see the generic error.
- Verify accessibility: every field has an associated `<label>`, the form is fully keyboard
  operable, focus is visible, and validation errors are programmatically associated
  (`aria-invalid` / `aria-describedby`). Color contrast meets AA.

## Done / success signals

- All automated tests green.
- Manual API steps return the expected status codes and bodies above.
- No `passwordHash` or plaintext password appears in any response or server log (SC-004).
- Login round-trips well under 1s; API endpoints under 500ms (SC-002, Principle V).
