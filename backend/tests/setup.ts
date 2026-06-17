/**
 * Vitest setup hook (backend).
 *
 * Integration tests run against a REAL Postgres test database (constitution requires
 * integration tests over real HTTP + DB). This setup points the Prisma client at the
 * test DB and provides safe defaults so unit-only runs stay green.
 *
 * setupFiles run before test modules import, so reassigning DATABASE_URL here takes
 * effect before the Prisma singleton (lib/prisma.ts) is constructed.
 */
import { beforeAll } from 'vitest';

// Route all DB access in tests to the dedicated test database.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

// Provide a JWT secret for tests if the environment doesn't set one.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  process.env.JWT_SECRET = 'test-secret-at-least-16-chars-long';
}
process.env.JWT_EXPIRES_IN ??= '24h';
process.env.NODE_ENV = 'test';
// Keep the functional login suite from tripping the limiter; the dedicated
// rate-limit test constructs its own limiter with an explicit low max.
process.env.RATE_LIMIT_LOGIN_MAX ??= '1000';

beforeAll(() => {
  if (!process.env.DATABASE_URL) {
    console.warn('[tests] DATABASE_URL is not set — integration tests will fail.');
  }
});
