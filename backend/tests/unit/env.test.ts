import { describe, it, expect } from 'vitest';
import { loadEnv } from '../../src/config/env.js';

// T008 — validated env config fails fast on missing/invalid values.
const valid = {
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  JWT_SECRET: 'a-sufficiently-long-secret',
  JWT_EXPIRES_IN: '24h',
  PORT: '3000',
  NODE_ENV: 'test',
};

describe('loadEnv', () => {
  it('parses a valid environment', () => {
    const env = loadEnv(valid);
    expect(env.JWT_SECRET).toBe('a-sufficiently-long-secret');
    expect(env.PORT).toBe(3000);
    expect(env.JWT_EXPIRES_IN).toBe('24h');
  });

  it('defaults JWT_EXPIRES_IN and PORT when omitted', () => {
    const { JWT_EXPIRES_IN, PORT, NODE_ENV, ...rest } = valid;
    void JWT_EXPIRES_IN;
    void PORT;
    void NODE_ENV;
    const env = loadEnv(rest);
    expect(env.JWT_EXPIRES_IN).toBe('24h');
    expect(env.PORT).toBe(3000);
  });

  it('throws when DATABASE_URL is missing', () => {
    const { DATABASE_URL, ...rest } = valid;
    void DATABASE_URL;
    expect(() => loadEnv(rest)).toThrow(/DATABASE_URL/);
  });

  it('throws when JWT_SECRET is too short', () => {
    expect(() => loadEnv({ ...valid, JWT_SECRET: 'short' })).toThrow(/JWT_SECRET/);
  });
});
