/**
 * Auth service (T029). Verifies credentials and issues a JWT. Depends on the
 * UserRepository interface (not Prisma directly) — Repository Pattern, Principle III.
 *
 * Security:
 * - Unknown email, wrong password, and disabled account all yield the SAME generic
 *   401 (FR-007, SC-003) so callers cannot enumerate users.
 * - On unknown email we still run a bcrypt comparison against a dummy hash to keep
 *   response timing uniform and avoid a timing oracle (Principle IV).
 * - The returned user contains only id + email; the hash is never exposed (FR-006).
 */
import { signToken } from '../lib/jwt.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { invalidCredentials } from '../middleware/error-handler.js';
import { userRepository, type UserRepository } from '../repositories/user.repository.js';
import { env } from '../config/env.js';
import type { LoginInput } from '../validation/auth.schema.js';

export interface PublicUser {
  id: string;
  email: string;
}

export interface LoginResult {
  token: string;
  user: PublicUser;
}

export interface AuthServiceDeps {
  userRepository: Pick<UserRepository, 'findByEmail'>;
  jwtSecret: string;
  jwtExpiresIn: string;
}

// Precomputed once at module load: a valid bcrypt hash to compare against when the
// user is unknown, equalizing timing between "no such user" and "wrong password".
const dummyHashPromise = hashPassword('dummy-password-for-timing-equalization');

export interface AuthService {
  login(input: LoginInput): Promise<LoginResult>;
}

export function createAuthService(deps: AuthServiceDeps): AuthService {
  return {
    async login(input: LoginInput): Promise<LoginResult> {
      const user = await deps.userRepository.findByEmail(input.email);

      // Always perform a comparison to keep timing uniform.
      const hashToCheck = user?.passwordHash ?? (await dummyHashPromise);
      const passwordMatches = await verifyPassword(input.password, hashToCheck);

      if (!user || !user.isActive || !passwordMatches) {
        throw invalidCredentials();
      }

      const token = signToken(
        { sub: user.id },
        { secret: deps.jwtSecret, expiresIn: deps.jwtExpiresIn },
      );
      return { token, user: { id: user.id, email: user.email } };
    },
  };
}

export const authService: AuthService = createAuthService({
  userRepository,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
});
