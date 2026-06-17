import { describe, it, expect, beforeAll } from 'vitest';
import { createAuthService } from '../../src/services/auth.service.js';
import { hashPassword } from '../../src/lib/password.js';
import { verifyToken } from '../../src/lib/jwt.js';
import { AppError } from '../../src/middleware/error-handler.js';
import type { UserRecord } from '../../src/repositories/user.repository.js';

// T024 [US1] — auth.service login. Generic failure for unknown email, wrong password,
// and disabled account (FR-007); never exposes the hash (FR-006).
const SECRET = 'test-secret-at-least-16-chars-long';
let activeUser: UserRecord;

function serviceWith(users: UserRecord[]) {
  return createAuthService({
    userRepository: {
      async findByEmail(email: string) {
        return users.find((u) => u.email === email.trim().toLowerCase()) ?? null;
      },
    },
    jwtSecret: SECRET,
    jwtExpiresIn: '1h',
  });
}

beforeAll(async () => {
  activeUser = {
    id: 'user-1',
    email: 'rep@example.com',
    passwordHash: await hashPassword('correct-password'),
    isActive: true,
  };
});

describe('auth.service login', () => {
  it('returns a verifiable token and non-sensitive user on valid credentials', async () => {
    const result = await serviceWith([activeUser]).login({
      email: 'rep@example.com',
      password: 'correct-password',
    });
    expect(result.user).toEqual({ id: 'user-1', email: 'rep@example.com' });
    expect(result).not.toHaveProperty('passwordHash');
    expect(JSON.stringify(result)).not.toContain('$2');
    expect(verifyToken(result.token, SECRET).sub).toBe('user-1');
  });

  it('normalizes the email before lookup (FR-011)', async () => {
    const result = await serviceWith([activeUser]).login({
      email: '  Rep@Example.COM ',
      password: 'correct-password',
    });
    expect(result.user.id).toBe('user-1');
  });

  it('throws generic INVALID_CREDENTIALS on wrong password', async () => {
    await expect(
      serviceWith([activeUser]).login({ email: 'rep@example.com', password: 'wrong' }),
    ).rejects.toMatchObject({ status: 401, code: 'INVALID_CREDENTIALS' });
  });

  it('throws the same generic error on unknown email', async () => {
    await expect(
      serviceWith([activeUser]).login({ email: 'nobody@example.com', password: 'whatever' }),
    ).rejects.toMatchObject({ status: 401, code: 'INVALID_CREDENTIALS' });
  });

  it('throws the same generic error for a disabled account', async () => {
    const disabled: UserRecord = { ...activeUser, id: 'user-2', email: 'off@example.com', isActive: false };
    const err = await serviceWith([disabled])
      .login({ email: 'off@example.com', password: 'correct-password' })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AppError);
    expect((err as AppError).code).toBe('INVALID_CREDENTIALS');
  });
});
