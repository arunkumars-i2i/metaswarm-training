# Phase 0 Research: Authentication

All Technical Context items resolved — no remaining NEEDS CLARIFICATION. The stack is fixed by
the constitution; the decisions below cover choices left open within that stack and the
security defaults applied from the spec's Assumptions.

## Decision: Password hashing with bcrypt

- **Decision**: Hash passwords with `bcrypt` using a work factor (cost) of 12, salted per
  password (bcrypt generates and embeds a unique salt).
- **Rationale**: Satisfies constitution Principle IV (salted hashing). bcrypt is battle-tested,
  widely supported in Node, and tunable via cost factor. Cost 12 balances security and the
  <500ms API budget (Principle V) for the login path.
- **Alternatives considered**: argon2id (excellent, memory-hard, also constitution-acceptable —
  chosen against only to minimize native build complexity for this training project); scrypt
  (fewer maintained Node wrappers); PBKDF2 (weaker against GPU attacks).

## Decision: Stateless JWT sessions

- **Decision**: Issue a signed JWT (HS256) on login containing `sub` (user id), `iat`, and
  `exp`. Default lifetime 24h (per spec Assumption). Secret loaded from `JWT_SECRET` env var.
- **Rationale**: Constitution mandates JWT (Principle IV). Stateless tokens keep the auth path
  lightweight and fast (Principle V) and avoid server-side session storage for v1's scale.
- **Alternatives considered**: Server-side sessions (more revocation control, but adds a store
  and state — unnecessary at this scale); RS256 (asymmetric keys — overkill for a single
  service).

## Decision: Logout strategy (client-side token discard)

- **Decision**: Logout is client-driven — the client discards the token and the protected route
  guard rejects further access. A `POST /logout` endpoint exists for a consistent contract and
  future server-side revocation.
- **Rationale**: Stateless JWTs cannot be individually invalidated without a server-side
  denylist; for v1's scope and short token lifetime, client discard satisfies FR-008 and the
  logout acceptance scenarios. Keeps the design simple (no extra store).
- **Alternatives considered**: Token denylist/blocklist in DB or cache (enables true
  server-side revocation; deferred as it adds infrastructure not justified at current scale —
  noted as a future enhancement); short-lived access + refresh tokens (deferred — out of scope
  for v1 single-token model).
- **Trade-off logged**: A token remains technically valid until expiry after logout. Mitigated
  by the 24h lifetime and client discard. Revisit with a denylist if stronger revocation is
  required.

## Decision: Token transport — Authorization header (Bearer)

- **Decision**: Client sends the JWT as `Authorization: Bearer <token>`; the frontend stores it
  in memory (with app-level context) and attaches it via the API client.
- **Rationale**: Simple, standard for SPA + REST, and works cleanly with TanStack Query and the
  Express auth middleware. In-memory storage avoids the XSS exposure of `localStorage` for the
  raw token.
- **Alternatives considered**: HttpOnly cookie (strong CSRF/XSS properties but adds CSRF
  handling and cookie config — deferred); `localStorage` (simplest but larger XSS blast radius).

## Decision: Request validation with zod

- **Decision**: Validate login input with a `zod` schema — email must be a valid email format,
  password must be a non-empty string — before any authentication logic runs.
- **Rationale**: Directly enforces FR-002/FR-003/SC-007; gives typed, inferred request types
  (supports Principle II, no `any`); produces validation errors distinct from auth errors.
- **Alternatives considered**: express-validator (less type inference); manual checks
  (error-prone, untyped).

## Decision: Generic authentication error

- **Decision**: All login failures (unknown email or wrong password) return one identical
  response: HTTP 401 with message "Invalid email or password." Validation failures return HTTP
  400 with field details.
- **Rationale**: Enforces FR-007/SC-003 (prevents user enumeration) while still giving useful
  feedback for malformed input (distinct 400 vs 401).
- **Alternatives considered**: Distinct "user not found" vs "wrong password" messages (rejected
  — enables enumeration).

## Decision: Brute-force protection via rate limiting

- **Decision**: Apply rate limiting to the login endpoint (e.g., `express-rate-limit`),
  throttling repeated attempts per IP/account window.
- **Rationale**: Satisfies FR-012 and the brute-force edge case with minimal complexity; no
  account-lockout state needed for v1.
- **Alternatives considered**: Account lockout after N failures (more user friction and state;
  deferred); CAPTCHA (heavier UX; deferred).

## Decision: Testing stack — Vitest + Supertest + React Testing Library

- **Decision**: Vitest for unit tests both tiers; Supertest over the Express app against a test
  PostgreSQL database for integration; React Testing Library for the login UI.
- **Rationale**: Vitest pairs naturally with the Vite frontend and runs fast for TDD
  (Principle I). Supertest exercises real HTTP + DB paths (constitution integration-test
  requirement). RTL supports accessible-by-role queries, reinforcing WCAG AA (Principle V).
- **Alternatives considered**: Jest (heavier config with ESM/Vite); Playwright for these flows
  (valuable for E2E later, heavier than needed for this feature's contract/integration tests).

## Decision: Accessible login form (WCAG 2.1 AA)

- **Decision**: Login form uses labeled inputs (`<label>` associated with controls), keyboard
  operability, visible focus states, programmatic error association (`aria-describedby`,
  `aria-invalid`), and AA-contrast Tailwind color choices.
- **Rationale**: Enforces Principle V (WCAG AA) at the only UI surface in this feature.
- **Alternatives considered**: Placeholder-only fields (fails labeling/contrast — rejected).
