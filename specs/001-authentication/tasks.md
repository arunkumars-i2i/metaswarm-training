---
description: "Task list for Authentication feature implementation"
---

# Tasks: Authentication

**Input**: Design documents from `/specs/001-authentication/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-api.md, quickstart.md

**Tests**: INCLUDED — the constitution (Principle I, Test-First, NON-NEGOTIABLE) and plan.md require
tests written first and failing before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every task

## Path Conventions

Web application (per plan.md Structure Decision): backend at `backend/`, frontend at `frontend/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and tooling for both tiers.

- [ ] T001 Create web-app project structure (`backend/` and `frontend/` trees) per plan.md
- [ ] T002 Initialize backend in `backend/`: `package.json`, TypeScript strict (no `any`), Express, Prisma, `jsonwebtoken`, `bcrypt`, `zod`, `express-rate-limit`, with `backend/tsconfig.json`
- [ ] T003 [P] Initialize frontend in `frontend/`: Vite + React 19 + React Router + TanStack Query + Tailwind, with `frontend/tsconfig.json` and `frontend/vite.config.ts`
- [ ] T004 [P] Configure ESLint + Prettier (strict, no `any`) for backend in `backend/.eslintrc.cjs` and `backend/.prettierrc`
- [ ] T005 [P] Configure ESLint + Prettier for frontend in `frontend/.eslintrc.cjs` and `frontend/.prettierrc`
- [ ] T006 [P] Configure Vitest + Supertest for backend in `backend/vitest.config.ts` (with test-DB setup hook in `backend/tests/setup.ts`)
- [ ] T007 [P] Configure Vitest + React Testing Library for frontend in `frontend/vitest.config.ts` and `frontend/tests/setup.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure shared across all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T008 Implement validated env config (`JWT_SECRET`, `DATABASE_URL`, `JWT_EXPIRES_IN` default `24h`) in `backend/src/config/env.ts`
- [ ] T009 Define Prisma `User` model (id, email unique, passwordHash, isActive, createdAt, updatedAt, `@@index([email])`) in `backend/prisma/schema.prisma` and generate the client
- [ ] T010 Create initial Prisma migration for the `User` table in `backend/prisma/migrations/`
- [ ] T011 [P] Implement bcrypt (cost 12) hash/compare wrappers in `backend/src/lib/password.ts`
- [ ] T012 [P] Implement JWT (HS256) sign/verify helpers with `sub`/`iat`/`exp` in `backend/src/lib/jwt.ts`
- [ ] T013 Implement `UserRepository` (only module importing Prisma for users; `findByEmail` case-insensitive) in `backend/src/repositories/user.repository.ts`
- [ ] T014 [P] Implement error-handler middleware + consistent error shape (`{ error: { code, message, details } }`) in `backend/src/middleware/error-handler.ts`
- [ ] T015 Create Express app bootstrap (JSON parsing, route/middleware wiring, error handler) in `backend/src/app.ts` and server entry in `backend/src/server.ts`
- [ ] T016 Create seed script for a known test user (bcrypt-hashed password) in `backend/prisma/seed.ts`
- [ ] T017 [P] Configure Tailwind with AA-contrast theme in `frontend/tailwind.config.ts` and base styles in `frontend/src/index.css`
- [ ] T018 [P] Implement API client that attaches `Authorization: Bearer <token>` in `frontend/src/lib/api-client.ts`
- [ ] T019 Implement in-memory auth/session context in `frontend/src/features/auth/context/AuthContext.tsx`
- [ ] T020 Set up app router with lazy routes and TanStack Query provider in `frontend/src/app/router.tsx` and `frontend/src/app/main.tsx`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Secure Login (Priority: P1) 🎯 MVP

**Goal**: A registered user signs in with email + password, receives a JWT, and reaches the CRM;
invalid input and bad credentials are rejected with the correct, non-revealing responses.

**Independent Test**: Submit valid and invalid credentials to `POST /api/auth/login` and the login
UI; confirm valid credentials return `200` + token (no `passwordHash`), bad credentials return a
generic `401`, and malformed email / missing password return `400`.

### Tests for User Story 1 (write first, must FAIL before implementation) ⚠️

- [ ] T021 [P] [US1] Unit test bcrypt hash/compare (hash ≠ plaintext, compare matches) in `backend/tests/unit/password.test.ts`
- [ ] T022 [P] [US1] Unit test JWT sign/verify (valid, tampered, expired) in `backend/tests/unit/jwt.test.ts`
- [ ] T023 [P] [US1] Unit test login zod schema (valid email, malformed email, empty password) in `backend/tests/unit/auth.schema.test.ts`
- [ ] T024 [P] [US1] Unit test `auth.service` login (success; wrong password, unknown email, disabled account all → identical generic failure) in `backend/tests/unit/auth.service.test.ts`
- [ ] T025 [P] [US1] Integration test `POST /api/auth/login` (200 with token & no hash; 401 generic; 400 validation) in `backend/tests/integration/login.test.ts`
- [ ] T026 [P] [US1] Frontend test `LoginForm` (labeled fields, `aria-invalid`/`aria-describedby`, validation errors) in `frontend/tests/LoginForm.test.tsx`
- [ ] T027 [P] [US1] Frontend test `useLogin` hook (success stores token, failure surfaces generic error) in `frontend/tests/useLogin.test.tsx`

### Implementation for User Story 1

- [ ] T028 [P] [US1] Implement login zod schema (email format, non-empty password, email normalized) in `backend/src/validation/auth.schema.ts`
- [ ] T029 [US1] Implement `auth.service` login (normalize email, lookup via `UserRepository`, bcrypt compare, reject `isActive=false`, issue JWT, never expose hash) in `backend/src/services/auth.service.ts`
- [ ] T030 [P] [US1] Implement login rate-limit middleware (`express-rate-limit`, 429 RATE_LIMITED) in `backend/src/middleware/rate-limit.ts`
- [ ] T031 [US1] Implement `POST /api/auth/login` route (validation → rate limit → service → 200/400/401) in `backend/src/routes/auth.routes.ts`
- [ ] T032 [P] [US1] Implement `useLogin` TanStack Query hook in `frontend/src/features/auth/api/useLogin.ts`
- [ ] T033 [P] [US1] Implement accessible `LoginForm` component (WCAG 2.1 AA) in `frontend/src/features/auth/components/LoginForm.tsx`
- [ ] T034 [US1] Implement lazy-loaded `LoginPage` and register its route in `frontend/src/features/auth/pages/LoginPage.tsx` (wired into `frontend/src/app/router.tsx`)

**Checkpoint**: User Story 1 is fully functional and testable independently — this is the MVP.

---

## Phase 4: User Story 2 - Secure Logout (Priority: P2)

**Goal**: An authenticated user logs out, ending the session; the discarded token no longer grants
access and the user is returned to the login screen.

**Independent Test**: Authenticate, call `POST /api/auth/logout` (expect `204`), discard the token,
then attempt a protected action and confirm the user is sent back to login.

### Tests for User Story 2 (write first, must FAIL before implementation) ⚠️

- [ ] T035 [P] [US2] Unit test `authenticate` middleware (valid token passes; missing/invalid → 401) in `backend/tests/unit/authenticate.test.ts`
- [ ] T036 [P] [US2] Integration test `POST /api/auth/logout` (204 with valid token; 401 without) in `backend/tests/integration/logout.test.ts`
- [ ] T037 [P] [US2] Frontend test logout action clears token in `AuthContext` and redirects to login in `frontend/tests/useLogout.test.tsx`

### Implementation for User Story 2

- [ ] T038 [US2] Implement `authenticate` JWT-verify middleware (Bearer token → attach user; 401 on missing/invalid/expired) in `backend/src/middleware/authenticate.ts`
- [ ] T039 [US2] Implement `POST /api/auth/logout` route (behind `authenticate`, returns 204) in `backend/src/routes/auth.routes.ts`
- [ ] T040 [P] [US2] Implement `useLogout` hook (discard in-memory token) in `frontend/src/features/auth/api/useLogout.ts`
- [ ] T041 [US2] Wire logout action in UI (clear `AuthContext`, redirect to login) in `frontend/src/features/auth/components/LogoutButton.tsx`

**Checkpoint**: User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - Protected Access & Session Expiry (Priority: P3)

**Goal**: Requests to protected resources require a valid, unexpired token; missing, tampered, or
expired tokens are rejected and the user is redirected to log in.

**Independent Test**: Call `GET /api/auth/me` and a protected resource with (a) a valid token →
`200`, (b) no token → `401`, (c) a tampered token → `401`, (d) an expired token → `401`; in the UI,
confirm an unauthenticated visit to a protected route redirects to login.

### Tests for User Story 3 (write first, must FAIL before implementation) ⚠️

- [ ] T042 [P] [US3] Integration test `GET /api/auth/me` (200 valid; 401 no token; 401 tampered; 401 expired) in `backend/tests/integration/me.test.ts`
- [ ] T043 [P] [US3] Integration test protected route rejects missing/invalid token via shared middleware in `backend/tests/integration/protected.test.ts`
- [ ] T044 [P] [US3] Frontend test `ProtectedRoute` redirects unauthenticated users to login in `frontend/tests/ProtectedRoute.test.tsx`
- [ ] T045 [P] [US3] Frontend test `useMe` hook (valid session resolves user; 401 clears session) in `frontend/tests/useMe.test.tsx`

### Implementation for User Story 3

- [ ] T046 [US3] Implement `GET /api/auth/me` route (behind `authenticate`, returns `{ user: { id, email } }`) in `backend/src/routes/auth.routes.ts`
- [ ] T047 [P] [US3] Implement `useMe` hook (gates routes, surfaces 401) in `frontend/src/features/auth/api/useMe.ts`
- [ ] T048 [US3] Implement `ProtectedRoute` guard (redirect to login when unauthenticated) in `frontend/src/features/auth/routes/ProtectedRoute.tsx`
- [ ] T049 [US3] Apply `ProtectedRoute` to protected CRM routes in `frontend/src/app/router.tsx`

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, security, performance, and accessibility verification across stories.

- [ ] T050 [P] Update README + API docs (endpoints, env vars, run/seed steps) in `docs/` and `backend/README.md`
- [ ] T051 [P] Verify no `passwordHash`/plaintext appears in any response or log; add log redaction check (SC-004) touching `backend/src/middleware/error-handler.ts`
- [ ] T052 [P] Accessibility audit of `LoginForm` against WCAG 2.1 AA (labels, focus, contrast, error association) in `frontend/src/features/auth/components/LoginForm.tsx`
- [ ] T053 Performance check: login round-trip < 1s, API endpoints < 500ms (SC-002, Principle V)
- [ ] T054 Run `quickstart.md` end-to-end validation (manual API + UI steps)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories.
- **User Stories (Phase 3–5)**: All depend on Foundational. Then run in priority order
  (P1 → P2 → P3) or in parallel if staffed.
- **Polish (Phase 6)**: Depends on the targeted user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational. No dependency on other stories — the MVP.
- **US2 (P2)**: Depends on Foundational. Introduces the `authenticate` middleware; independently
  testable. Reuses the login path only to obtain a token for its test.
- **US3 (P3)**: Depends on Foundational. Reuses the `authenticate` middleware from US2 (shared
  infrastructure); independently testable via `/me` and protected routes.

### Within Each User Story

- Tests are written and FAIL before implementation (Principle I).
- Libs/schema (e.g., password, jwt, zod) before services; services before routes; routes before
  UI wiring. Models/repositories already exist from Foundational.

### Parallel Opportunities

- Setup tasks marked [P] (T003–T007) run in parallel.
- Foundational tasks marked [P] (T011, T012, T014, T017, T018) run in parallel.
- All tests within a story marked [P] run in parallel before that story's implementation.
- Backend and frontend implementation tasks marked [P] within a story run in parallel.
- With multiple developers, US1/US2/US3 can proceed in parallel once Foundational is done.

---

## Parallel Example: User Story 1

```bash
# Launch all US1 tests together (must fail first):
Task: "Unit test bcrypt hash/compare in backend/tests/unit/password.test.ts"
Task: "Unit test JWT sign/verify in backend/tests/unit/jwt.test.ts"
Task: "Unit test login zod schema in backend/tests/unit/auth.schema.test.ts"
Task: "Unit test auth.service login in backend/tests/unit/auth.service.test.ts"
Task: "Integration test POST /api/auth/login in backend/tests/integration/login.test.ts"
Task: "Frontend test LoginForm in frontend/tests/LoginForm.test.tsx"
Task: "Frontend test useLogin hook in frontend/tests/useLogin.test.tsx"

# Launch parallel US1 implementation tasks together:
Task: "Implement login zod schema in backend/src/validation/auth.schema.ts"
Task: "Implement login rate-limit middleware in backend/src/middleware/rate-limit.ts"
Task: "Implement useLogin hook in frontend/src/features/auth/api/useLogin.ts"
Task: "Implement LoginForm component in frontend/src/features/auth/components/LoginForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories).
3. Complete Phase 3: User Story 1 (Secure Login).
4. **STOP and VALIDATE**: Test login independently (quickstart steps 1–5).
5. Deploy/demo the MVP.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. Add US1 (login) → validate → demo (MVP).
3. Add US2 (logout) → validate → demo.
4. Add US3 (protected access & expiry) → validate → demo.

### Parallel Team Strategy

After Foundational completes: Developer A → US1, Developer B → US2, Developer C → US3. Each story
is independently testable and integrates without breaking the others.

---

## Notes

- [P] = different files, no dependencies on incomplete tasks.
- [Story] label maps each task to its user story for traceability.
- Verify every test fails before implementing (TDD, Principle I).
- Commit after each task or logical group.
- Never log or return `passwordHash` or plaintext passwords (FR-006, SC-004).
