<!--
SYNC IMPACT REPORT
==================
Version change: (template/unversioned) → 1.0.0
Rationale: Initial ratification of the project constitution from the template.
  First concrete definition of all principles and governance, so MAJOR baseline 1.0.0.

Modified principles: N/A (initial creation)
  - [PRINCIPLE_1_NAME]  → I. Test-First Development (NON-NEGOTIABLE)
  - [PRINCIPLE_2_NAME]  → II. Type Safety & Code Quality
  - [PRINCIPLE_3_NAME]  → III. Layered Architecture
  - [PRINCIPLE_4_NAME]  → IV. Security by Default
  - [PRINCIPLE_5_NAME]  → V. Performance & Accessibility
  - (added)             → VI. Documentation as a Deliverable

Added sections:
  - Technology Stack Constraints (was [SECTION_2_NAME])
  - Development Workflow & Quality Gates (was [SECTION_3_NAME])

Removed sections: None

Templates requiring updates:
  - ✅ .specify/templates/plan-template.md   (Constitution Check gate is generic; aligns)
  - ✅ .specify/templates/spec-template.md   (no mandatory sections added/removed; aligns)
  - ✅ .specify/templates/tasks-template.md  (TDD + quality task types covered; aligns)

Follow-up TODOs: None
-->

# Simple CRM Constitution

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

TDD is mandatory for every feature and bug fix. The Red-Green-Refactor cycle MUST be
followed: tests are written first, confirmed to fail, and only then is implementation
code written to make them pass.

- Unit tests MUST cover business logic, repositories, services, and pure functions.
- Integration tests MUST cover API endpoints end-to-end, including the database and
  authentication boundaries.
- A pull request that adds or changes behavior without accompanying tests MUST NOT merge.
- Implementation committed before its failing test is a violation and MUST be reworked.

**Rationale**: Tests written after the fact validate the implementation rather than the
requirement. Writing them first forces a clear contract and prevents regressions in a
system that manages customer data and sales activity.

### II. Type Safety & Code Quality

The codebase MUST be fully typed and consistently formatted, enforced automatically rather
than by review alone.

- TypeScript strict mode MUST be enabled across frontend and backend.
- The `any` type is forbidden; use `unknown`, generics, or explicit types instead.
- ESLint MUST pass with zero errors before merge.
- Prettier MUST be the single source of formatting truth; unformatted code MUST NOT merge.
- These checks MUST run in CI and block merge on failure.

**Rationale**: Strict typing and automated linting/formatting eliminate an entire class of
runtime defects and remove style debate from code review, keeping reviews focused on logic.

### III. Layered Architecture

The system MUST preserve clear separation of concerns across frontend and backend.

- Frontend MUST be organized feature-first: each feature owns its components, hooks,
  routes, and data access; cross-feature imports go through shared modules, not deep paths.
- Backend MUST use the Repository Pattern: data access is isolated behind repositories,
  and services/controllers MUST NOT issue database queries directly.
- All client-server communication MUST occur over versioned REST APIs with consistent
  request/response and error conventions.
- Server state on the frontend MUST be managed through TanStack Query, not ad-hoc fetching.

**Rationale**: A consistent layering makes the codebase predictable, testable in isolation,
and resistant to the coupling that makes CRM systems hard to evolve.

### IV. Security by Default

Authentication and sensitive-data handling are non-negotiable baseline requirements.

- Authentication MUST use JWT; protected endpoints MUST reject missing or invalid tokens.
- Passwords MUST be hashed with a strong, salted algorithm (e.g., bcrypt/argon2) and MUST
  NEVER be stored or logged in plaintext.
- Secrets and credentials MUST come from environment configuration, never from source.
- Input on every endpoint MUST be validated and authorization checked before any data
  access.

**Rationale**: A CRM holds personal and commercial data; a single auth or storage lapse is
a breach. Security is treated as a precondition, not a later hardening step.

### V. Performance & Accessibility

The application MUST be responsive and usable by everyone.

- API endpoints MUST respond in under 500ms under expected load; slower paths MUST be
  measured and justified or optimized.
- Frontend routes MUST be lazy-loaded to keep initial bundle size small.
- The UI MUST meet WCAG 2.1 AA, including keyboard navigation, color contrast, and labeled
  controls.

**Rationale**: Sales users work at speed; latency and inaccessible interfaces directly cost
productivity and exclude users. Both are measurable and therefore enforceable.

### VI. Documentation as a Deliverable

Documentation ships with the code, not afterward.

- A README MUST exist and stay current with setup, environment, and run/test instructions.
- All REST endpoints MUST be documented (request, response, auth, error shapes).
- A feature is not "done" until its public behavior and APIs are documented.

**Rationale**: Up-to-date documentation is what makes a small team's CRM maintainable and
onboardable; treating it as a deliverable keeps it honest.

## Technology Stack Constraints

The approved stack is binding; deviations require an amendment under Governance.

- **Frontend**: React 19, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS.
- **Backend**: Node.js, Express, PostgreSQL, Prisma (Prisma is the data-access layer
  behind the repositories required by Principle III).
- **APIs**: REST.

New runtime dependencies MUST be justified against existing stack capabilities before
adoption.

## Development Workflow & Quality Gates

Every change passes through the same gates before merge:

1. Failing tests written first (Principle I).
2. Implementation makes tests pass; unit and integration suites green.
3. TypeScript strict compile, ESLint, and Prettier all pass in CI (Principle II).
4. Security review for any change touching auth, passwords, or data access (Principle IV).
5. Performance and accessibility checks for changes affecting endpoints or UI (Principle V).
6. README and API documentation updated when behavior or contracts change (Principle VI).

CI MUST enforce gates 2–3 automatically; merge MUST be blocked on any failure.

## Governance

This constitution supersedes other development practices. When guidance conflicts, the
constitution wins.

- **Amendments**: Proposed via pull request describing the change and rationale, reviewed
  and approved by the project maintainers, with a migration note when the change affects
  existing code or workflow.
- **Versioning**: Semantic versioning of this document:
  - MAJOR — backward-incompatible removal or redefinition of a principle or governance rule.
  - MINOR — a new principle/section or materially expanded guidance.
  - PATCH — clarifications, wording, and non-semantic refinements.
- **Compliance**: All pull requests MUST verify adherence to these principles. Any
  justified deviation MUST be recorded in the plan's Complexity Tracking section with the
  reason and the simpler alternative that was rejected.

**Version**: 1.0.0 | **Ratified**: 2026-06-17 | **Last Amended**: 2026-06-17
