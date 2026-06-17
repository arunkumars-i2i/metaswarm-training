# Implementation Plan: Authentication

**Branch**: `001-authentication` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-authentication/spec.md`

## Summary

Deliver email/password authentication for the CRM: a stateless JWT-based login, a logout that
ends the session, and middleware that protects every CRM resource. Passwords are stored only as
salted hashes. The backend follows the Repository Pattern (Express + Prisma + PostgreSQL); the
frontend is a feature-first React 19 module (Vite, React Router, TanStack Query, Tailwind) with
a login screen, logout action, and route guarding. Development is test-first per the
constitution.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode, no `any`); Node.js 20 LTS; React 19

**Primary Dependencies**:
- Backend: Express, Prisma (PostgreSQL client), `jsonwebtoken` (JWT), `bcrypt` (password
  hashing), `zod` (request validation)
- Frontend: React 19, Vite, React Router, TanStack Query, Tailwind CSS

**Storage**: PostgreSQL via Prisma ORM (Prisma is the data-access layer behind repositories)

**Testing**: Vitest (unit, both tiers); Supertest + Vitest (backend integration over HTTP +
test database); React Testing Library + Vitest (frontend component/integration)

**Target Platform**: Linux server (REST API); modern evergreen browsers (SPA frontend)

**Project Type**: Web application (separate `backend/` and `frontend/`)

**Performance Goals**: All API endpoints respond < 500ms under expected load (constitution
Principle V); login result surfaced to the user in < 1s (SC-002)

**Constraints**: TypeScript strict, no `any` (Principle II); JWT auth + salted password hashing
(Principle IV); WCAG 2.1 AA for the login UI (Principle V); generic auth errors to prevent user
enumeration (FR-007)

**Scale/Scope**: Small sales team; login/logout + protected-route enforcement. Account
creation, password reset, and MFA are out of scope (per spec Assumptions).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Test-First (NON-NEGOTIABLE) | Unit + integration tests written first; failing before implementation | ✅ Plan sequences tests before code; quickstart defines runnable validation |
| II. Type Safety & Code Quality | TS strict, no `any`, ESLint + Prettier in CI | ✅ Stack-wide strict TS; zod for typed validation |
| III. Layered Architecture | Repository Pattern backend; feature-first frontend; REST | ✅ `UserRepository` isolates Prisma; `features/auth/` on frontend; REST contracts |
| IV. Security by Default | JWT, salted hashing, env secrets, validation+authz | ✅ bcrypt hashing, JWT, `JWT_SECRET` from env, zod validation, auth middleware |
| V. Performance & Accessibility | API <500ms, lazy routes, WCAG AA | ✅ Lightweight auth path; lazy-loaded auth routes; accessible login form |
| VI. Documentation as Deliverable | README + API docs current | ✅ Contracts documented in `contracts/`; quickstart provided |

**Result**: PASS — no violations. Complexity Tracking section intentionally left empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-authentication/
├── plan.md              # This file (/speckit-plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (REST contracts)
│   ├── auth-api.md
│   └── openapi.yaml
└── checklists/
    └── requirements.md  # Spec quality checklist (from /speckit-specify)
```

### Source Code (repository root)

```text
backend/
├── prisma/
│   └── schema.prisma                  # User model (see data-model.md)
├── src/
│   ├── config/
│   │   └── env.ts                     # Validated env (JWT_SECRET, DATABASE_URL, ...)
│   ├── repositories/
│   │   └── user.repository.ts         # Prisma-backed data access (Repository Pattern)
│   ├── services/
│   │   └── auth.service.ts            # login/logout/verify; hashing; token issue
│   ├── middleware/
│   │   ├── authenticate.ts            # JWT verification guard for protected routes
│   │   └── error-handler.ts           # Consistent error responses
│   ├── routes/
│   │   └── auth.routes.ts             # POST /login, POST /logout, GET /me
│   ├── validation/
│   │   └── auth.schema.ts             # zod schemas (email format, password required)
│   └── lib/
│       ├── password.ts                # bcrypt hash/compare wrappers
│       └── jwt.ts                     # sign/verify helpers
└── tests/
    ├── unit/                          # service, password, jwt, validation
    └── integration/                   # login/logout/me over HTTP + test DB

frontend/
├── src/
│   ├── features/
│   │   └── auth/
│   │       ├── api/                   # TanStack Query hooks (useLogin, useLogout, useMe)
│   │       ├── components/            # LoginForm, accessible fields
│   │       ├── pages/                 # LoginPage (lazy-loaded route)
│   │       ├── context/               # auth/session state
│   │       └── routes/                # ProtectedRoute guard
│   ├── lib/                           # api client (token attach)
│   └── app/                           # router with lazy routes
└── tests/                             # RTL component + integration tests
```

**Structure Decision**: Web application (Option 2). Backend and frontend are separate projects.
The backend enforces the Repository Pattern (`user.repository.ts` is the only module importing
Prisma for users); the frontend is feature-first with everything auth-related under
`features/auth/`. This directly satisfies constitution Principle III.

## Complexity Tracking

No constitution violations — no entries required.
