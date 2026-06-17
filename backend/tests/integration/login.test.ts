import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';
import { hashPassword } from '../../src/lib/password.js';

// T025 [US1] — POST /api/auth/login over real HTTP + test DB.
const app = createApp();

beforeAll(async () => {
  await prisma.user.deleteMany();
  await prisma.user.create({
    data: {
      email: 'rep@example.com',
      passwordHash: await hashPassword('correct-password'),
      isActive: true,
    },
  });
  await prisma.user.create({
    data: {
      email: 'disabled@example.com',
      passwordHash: await hashPassword('correct-password'),
      isActive: false,
    },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('POST /api/auth/login', () => {
  it('returns 200 with a token and non-sensitive user on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rep@example.com', password: 'correct-password' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user).toEqual({ id: expect.any(String), email: 'rep@example.com' });
    expect(res.text).not.toContain('passwordHash');
    expect(res.text).not.toContain('$2'); // no bcrypt hash leaked
  });

  it('normalizes email casing/whitespace (FR-011)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '  Rep@Example.COM ', password: 'correct-password' });
    expect(res.status).toBe(200);
  });

  it('returns generic 401 INVALID_CREDENTIALS on wrong password (FR-007)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rep@example.com', password: 'wrong-password' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(res.body.error.message).toBe('Invalid email or password.');
  });

  it('returns the identical 401 body on unknown email (SC-003)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'correct-password' });
    expect(res.status).toBe(401);
    expect(res.body.error).toEqual({
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
      details: [],
    });
  });

  it('returns the identical 401 body for a disabled account', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'disabled@example.com', password: 'correct-password' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 400 VALIDATION_ERROR on malformed email (SC-007)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'correct-password' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 VALIDATION_ERROR when password is missing (FR-003)', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'rep@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
