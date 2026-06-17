/**
 * UserRepository (T013) — the ONLY module that touches Prisma for users
 * (Repository Pattern, constitution Principle III). Services depend on this interface,
 * never on Prisma directly.
 */
import { prisma } from '../lib/prisma.js';

/** A user as needed by the auth flow, including the hash for verification. */
export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
}

/** Normalize an email for storage/lookup: trim + lower-case (FR-011). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
}

export const userRepository: UserRepository = {
  /** Look up a user by email (case-insensitive via normalization). */
  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
      select: { id: true, email: true, passwordHash: true, isActive: true },
    });
    return user;
  },
};
