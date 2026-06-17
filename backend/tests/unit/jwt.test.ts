import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '../../src/lib/jwt.js';

// T022 [US1] — JWT sign/verify wrapper. Tests written before implementation (Principle I).
const SECRET = 'test-secret-at-least-16-chars-long';

describe('jwt lib', () => {
  it('signs a token carrying the subject and verifies it back', () => {
    const token = signToken({ sub: 'user-123' }, { secret: SECRET, expiresIn: '1h' });
    expect(token.split('.')).toHaveLength(3);
    const payload = verifyToken(token, SECRET);
    expect(payload.sub).toBe('user-123');
    expect(payload.iat).toBeTypeOf('number');
    expect(payload.exp).toBeTypeOf('number');
  });

  it('throws on a tampered token', () => {
    const token = signToken({ sub: 'user-123' }, { secret: SECRET, expiresIn: '1h' });
    const tampered = token.slice(0, -2) + (token.endsWith('a') ? 'bb' : 'aa');
    expect(() => verifyToken(tampered, SECRET)).toThrow();
  });

  it('throws when verified with the wrong secret', () => {
    const token = signToken({ sub: 'user-123' }, { secret: SECRET, expiresIn: '1h' });
    expect(() => verifyToken(token, 'a-different-secret-16chars')).toThrow();
  });

  it('throws on an expired token', () => {
    const token = signToken({ sub: 'user-123' }, { secret: SECRET, expiresIn: '-1s' });
    expect(() => verifyToken(token, SECRET)).toThrow();
  });
});
