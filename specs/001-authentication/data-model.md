# Phase 1 Data Model: Authentication

Derived from the spec's Key Entities and Database Requirements. The persistent store is
PostgreSQL accessed through Prisma; all user data access is mediated by `UserRepository`
(Repository Pattern, constitution Principle III).

## Entity: User

Represents a person who can sign in to the CRM (sales representative or sales manager).

| Field          | Type                  | Constraints / Notes                                              |
|----------------|-----------------------|-----------------------------------------------------------------|
| `id`           | string (UUID/cuid)    | Primary key, generated.                                          |
| `email`        | string                | **Unique**, required. Stored lower-cased; matched case-insensitively. |
| `passwordHash` | string                | Required. bcrypt hash only — **never** plaintext. Never serialized to clients. |
| `isActive`     | boolean               | Required, default `true`. Disabled accounts cannot authenticate. |
| `createdAt`    | datetime              | Required, set on creation.                                       |
| `updatedAt`    | datetime              | Required, auto-updated on change.                                |

### Validation Rules

- `email` MUST be a valid email format (enforced at the API boundary via zod) and is normalized
  (trimmed, lower-cased) before storage and lookup — FR-002, FR-011.
- `passwordHash` MUST be the output of bcrypt (cost 12); the raw password is never persisted —
  FR-006.
- `email` uniqueness MUST be enforced at the database level (unique index) — Database
  Requirements.
- A user with `isActive = false` MUST be rejected at login even with correct credentials — edge
  case "inactive/disabled account."

### Serialization Rule

- The public representation of a User (e.g., the `/me` response) MUST include only
  non-sensitive fields: `id`, `email`. `passwordHash` MUST NOT appear in any API response or
  log — FR-006, SC-004.

### Prisma model (reference)

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([email])
}
```

> Note: account creation/seeding is out of scope for this feature (spec Assumptions). A seed
> script or admin process supplies initial users; this model only supports authenticating them.

## Conceptual Entity: Session (not persisted)

The authenticated session is represented by a stateless JWT, not a database row.

| Claim   | Meaning                                  |
|---------|------------------------------------------|
| `sub`   | The authenticated user's `id`.           |
| `iat`   | Issued-at timestamp.                     |
| `exp`   | Expiry timestamp (default: issued + 24h).|

### Rules

- The token is signed with `JWT_SECRET` (HS256) and verified on every protected request —
  FR-005, FR-009, FR-010.
- An invalid, tampered, or expired token MUST be rejected (HTTP 401) — FR-010, US3.
- Logout is represented by the client discarding the token; no persisted session state exists in
  v1 (see research.md "Logout strategy").

## Relationships

- A `User` is the owner/subject of a `Session` (1 user → many concurrent tokens permitted; spec
  Assumption: concurrent sessions allowed).
- Relationships from `User` to other CRM entities (customers, notes) are defined by those
  features, not here.
