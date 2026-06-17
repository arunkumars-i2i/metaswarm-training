/**
 * JWT sign/verify helpers (T012).
 *
 * Stateless HS256 sessions (research.md). The token carries `sub` (user id); `iat`/`exp`
 * are added by jsonwebtoken. Verification rejects tampered, wrong-secret, and expired
 * tokens (FR-005, FR-009, FR-010).
 */
import jwt from 'jsonwebtoken';

export interface TokenPayload {
  sub: string;
  iat: number;
  exp: number;
}

export interface SignOptions {
  secret: string;
  expiresIn: string;
}

/** Sign a JWT for the given claims. */
export function signToken(claims: { sub: string }, options: SignOptions): string {
  return jwt.sign({ sub: claims.sub }, options.secret, {
    algorithm: 'HS256',
    expiresIn: options.expiresIn as NonNullable<jwt.SignOptions['expiresIn']>,
  });
}

/**
 * Verify a JWT and return its payload. Throws (jsonwebtoken error) if the token is
 * invalid, tampered, signed with a different secret, or expired.
 */
export function verifyToken(token: string, secret: string): TokenPayload {
  const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
  if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
    throw new Error('Invalid token payload');
  }
  return decoded as TokenPayload;
}
