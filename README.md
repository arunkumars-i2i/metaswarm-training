# CRM Authentication

Email/password authentication for a CRM: stateless JWT login, logout, and middleware that
protects CRM resources. Passwords are stored only as salted hashes. Built test-first per the
project constitution.

Feature spec and design live in [`specs/001-authentication/`](./specs/001-authentication/)
(spec, plan, data model, REST contracts, research, quickstart).

## Stack

| Tier | Technology |
|------|------------|
| Backend | TypeScript (strict) · Node.js 20+ · Express · Prisma · PostgreSQL · `jsonwebtoken` · `bcryptjs` · `zod` · `express-rate-limit` |
| Frontend | TypeScript (strict) · React 19 · Vite · React Router · TanStack Query · Tailwind CSS |
| Tests | Vitest + Supertest (backend) · Vitest + React Testing Library (frontend) |
| Data | PostgreSQL (via Docker Compose) accessed through Prisma behind the Repository Pattern |

Architecture: the backend isolates all user data access in `UserRepository`; the frontend is
feature-first with everything auth-related under `src/features/auth/`. Sessions are stateless
HS256 JWTs (24h default); passwords are hashed with bcrypt (cost 12).

## Project layout

```text
.
├── backend/                  # Express + Prisma REST API
│   ├── prisma/               # schema.prisma, migrations, seed
│   └── src/
│       ├── config/           # validated env (env.ts)
│       ├── lib/              # password (bcrypt), jwt, prisma client
│       ├── repositories/     # UserRepository (only Prisma user access)
│       ├── services/         # auth.service (login/verify)
│       ├── middleware/       # error-handler, rate-limit, authenticate*
│       ├── routes/           # auth.routes (/api/auth/*)
│       └── validation/       # zod schemas
├── frontend/                 # React 19 + Vite SPA
│   └── src/
│       ├── features/auth/    # api hooks, components, pages, context, routes
│       ├── lib/              # api client, in-memory token store
│       └── app/              # router (lazy routes) + TanStack Query provider
├── docker-compose.yml        # local PostgreSQL (dev + test DBs)
└── specs/001-authentication/ # feature spec, plan, contracts, quickstart
```
`*` `authenticate` middleware and the protected-route/`/me` flows arrive in later work units
(see [Status](#status)).

## Prerequisites

- Node.js 20+ and npm
- Docker (for the local PostgreSQL instance)

## Setup

```bash
# 1. Start PostgreSQL (creates crm_auth + crm_auth_test databases)
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env          # then set a strong JWT_SECRET (see the file's comment)
npm install
npx prisma migrate dev        # apply the User schema
npm run seed                  # create a known test user (rep@example.com / Password123!)
npm run dev                   # API on http://localhost:3000

# 3. Frontend (separate terminal)
cd frontend
npm install
npm run dev                   # SPA on http://localhost:5173 (proxies /api to the backend)
```

> **Port note:** if `3000` is already in use, change `PORT` in `backend/.env`.

### Environment variables (backend)

| Variable | Purpose | Default |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | — (required) |
| `TEST_DATABASE_URL` | Connection string for the integration test DB | — |
| `JWT_SECRET` | Secret for signing JWTs (≥16 chars) | — (required) |
| `JWT_EXPIRES_IN` | Token lifetime | `24h` |
| `PORT` | API port | `3000` |
| `RATE_LIMIT_LOGIN_MAX` | Max login attempts per IP per window | `10` |

Secrets are never committed — `.env` is gitignored; `.env.example` documents the shape.

## API

Base path `/api/auth`. Errors use a consistent shape:
`{ "error": { "code", "message", "details": [] } }`.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Authenticate; returns `{ token, user: { id, email } }`. Generic `401 INVALID_CREDENTIALS` on any failure; `400 VALIDATION_ERROR` on bad input; `429 RATE_LIMITED` past the throttle. |
| `POST` | `/api/auth/logout` | End the session (planned — WU4). |
| `GET`  | `/api/auth/me` | Current user's basic profile (planned — WU5). |

Full contract: [`specs/001-authentication/contracts/auth-api.md`](./specs/001-authentication/contracts/auth-api.md).

### Quick check

```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"rep@example.com","password":"Password123!"}'
# → {"token":"...","user":{"id":"...","email":"rep@example.com"}}
```

## Testing

```bash
# Backend (unit + integration over a real test DB — requires docker compose up)
cd backend && npm test

# Frontend (component/integration)
cd frontend && npm test
```

Lint and type-check both tiers with `npm run lint` and `npm run typecheck`.

## Status

This feature is being built incrementally by user story:

- [x] **US1 — Secure Login** (MVP): `POST /api/auth/login`, accessible login UI, JWT issuance
- [ ] **US2 — Secure Logout**: `authenticate` middleware, `POST /api/auth/logout`
- [ ] **US3 — Protected Access & Session Expiry**: `GET /api/auth/me`, route guard
- [ ] **Polish**: docs, log redaction, accessibility audit, performance check

Account creation, password reset, and MFA are out of scope for this feature.
