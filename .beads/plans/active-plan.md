---
status: in-progress
epic: metaswarm-training-haz
feature: 001-authentication
created: 2026-06-17
---

# Implementation Plan: Authentication (001-authentication)

Source of truth: `specs/001-authentication/` (spec.md, plan.md, data-model.md,
contracts/auth-api.md, research.md, quickstart.md, tasks.md).

## Goal

Deliver email/password authentication for the CRM: JWT login, logout, and middleware that
protects CRM resources. Backend = Express + Prisma + PostgreSQL (Repository Pattern). Frontend
= React 19 + Vite (feature-first). TDD per constitution Principle I.

## Execution model

Full orchestrated flow. Per work unit: **IMPLEMENT → VALIDATE → ADVERSARIAL REVIEW → COMMIT**.
Quality gates run independently (never trust subagent self-reports). Max 3 retries per unit,
then escalate. No `--no-verify`, no skipped coverage gates, no self-certification.

## Work Units (BEADS)

Epic: `metaswarm-training-haz`

| WU | BEADS ID | Phase / Tasks | Depends on |
|----|----------|---------------|------------|
| WU1 Setup | metaswarm-training-lej | Phase 1, T001–T007 | — |
| WU2 Foundational | metaswarm-training-0kn | Phase 2, T008–T020 | WU1 |
| WU3 US1 Secure Login (MVP) | metaswarm-training-bql | Phase 3, T021–T034 | WU2 |
| WU4 US2 Secure Logout | metaswarm-training-79s | Phase 4, T035–T041 | WU2 |
| WU5 US3 Protected Access & Expiry | metaswarm-training-czs | Phase 5, T042–T049 | WU2 |
| WU6 Polish | metaswarm-training-0hp | Phase 6, T050–T054 | WU3, WU4, WU5 |

## File scope (per plan.md)

- Backend: `backend/prisma/`, `backend/src/{config,repositories,services,middleware,routes,validation,lib}/`,
  `backend/src/{app,server}.ts`, `backend/tests/{unit,integration}/`.
- Frontend: `frontend/src/features/auth/{api,components,pages,context,routes}/`,
  `frontend/src/{lib,app}/`, `frontend/tests/`.
- Docs: `docs/`, `backend/README.md`.

## Definition of Done (epic-level)

- All spec.md acceptance scenarios (US1 #1–5, US2 #1–2, US3 #1–2) pass.
- SC-001..SC-007 met. Notably: generic 401 for all login failures (SC-003); no plaintext/hash
  in any response or log (SC-004); protected resources deny missing/invalid tokens (SC-006).
- All automated tests pass (Vitest unit + Supertest integration + RTL).
- TS strict (no `any`), ESLint + Prettier clean.
- quickstart.md manual validation steps green.

## Human checkpoints

1. After WU3 (US1 login MVP) — STOP and validate the MVP before continuing.
2. After WU6 — final integration review before PR.

## Risks / decisions (from research.md)

- Stateless JWT: logout is client token-discard; token valid until expiry (accepted trade-off,
  24h lifetime). Future: denylist.
- bcrypt cost 12 balances security vs <500ms login budget.
- Generic 401 prevents user enumeration; 400 (validation) kept distinct from 401 (auth).
- Rate limiting (express-rate-limit) for brute-force (FR-012).
