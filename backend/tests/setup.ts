/**
 * Vitest setup hook (backend).
 *
 * Integration tests run against a real Postgres test database (constitution requires
 * integration tests over real HTTP + DB). The test DB connection comes from DATABASE_URL,
 * which docker-compose + the test env provide. WU2 adds the actual migration/cleanup logic;
 * for now this only asserts the environment is sane so failures are legible, not cryptic.
 */
import { beforeAll } from 'vitest';

beforeAll(() => {
  if (!process.env.DATABASE_URL) {
    // Unit tests don't need a DB; integration tests will fail explicitly if it's missing.
    // Keep this a warning, not a throw, so unit-only runs stay green.
    console.warn('[tests] DATABASE_URL is not set — integration tests will be skipped/fail.');
  }
});
