import { describe, it, expect } from 'vitest';

// WU1 tooling smoke test — proves the Vitest + jsdom runner is wired up.
// Replaced by real feature tests in WU3+.
describe('frontend test runner', () => {
  it('runs', () => {
    expect(true).toBe(true);
  });
});
