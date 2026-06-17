import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/lib/password.js';

// T021 [US1] — bcrypt hashing wrapper. Tests written before implementation (Principle I).
describe('password lib', () => {
  it('hashes a password to a non-plaintext bcrypt string', async () => {
    const hash = await hashPassword('s3cret-pass');
    expect(hash).not.toBe('s3cret-pass');
    expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt hash prefix
    expect(hash.length).toBeGreaterThan(50);
  });

  it('produces different hashes for the same password (per-password salt)', async () => {
    const a = await hashPassword('same-password');
    const b = await hashPassword('same-password');
    expect(a).not.toBe(b);
  });

  it('verifies a correct password against its hash', async () => {
    const hash = await hashPassword('correct-horse');
    await expect(verifyPassword('correct-horse', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('correct-horse');
    await expect(verifyPassword('wrong-horse', hash)).resolves.toBe(false);
  });
});
