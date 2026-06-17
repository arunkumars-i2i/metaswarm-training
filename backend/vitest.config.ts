import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    // Integration tests share a single Postgres test DB; run serially to avoid races.
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
  },
});
