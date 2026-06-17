import { describe, it, expect } from 'vitest';
import { loginSchema } from '../../src/validation/auth.schema.js';

// T023 [US1] — login input validation (FR-002 email format, FR-003 non-empty password, FR-011 normalize).
describe('loginSchema', () => {
  it('accepts a valid email and password and normalizes the email', () => {
    const result = loginSchema.safeParse({ email: '  Rep@Example.COM ', password: 's3cret' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('rep@example.com'); // trimmed + lower-cased
      expect(result.data.password).toBe('s3cret');
    }
  });

  it('rejects a malformed email (FR-002)', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 's3cret' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty password (FR-003)', () => {
    const result = loginSchema.safeParse({ email: 'rep@example.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing password field', () => {
    const result = loginSchema.safeParse({ email: 'rep@example.com' });
    expect(result.success).toBe(false);
  });
});
