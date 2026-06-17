/**
 * Password hashing wrappers (T011).
 *
 * Uses bcryptjs (pure-JS bcrypt) at cost 12 — same salted bcrypt algorithm as native
 * bcrypt, chosen to avoid native build complexity on Node 24 (research.md intent;
 * constitution Principle IV: salted hashing). All hashing flows through this module so
 * the implementation can be swapped without touching callers.
 */
import bcrypt from 'bcryptjs';

const COST = 12;

/** Hash a plaintext password with a freshly generated per-password salt. */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, COST);
}

/** Compare a plaintext password against a stored bcrypt hash. */
export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}
