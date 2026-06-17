import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createLoginRateLimiter } from '../../src/middleware/rate-limit.js';
import { errorHandler } from '../../src/middleware/error-handler.js';

// T030 / FR-012 — brute-force throttling returns 429 RATE_LIMITED past the limit.
function appWithLimit(max: number) {
  const app = express();
  app.use(express.json());
  app.post('/login', createLoginRateLimiter({ max, windowMs: 60_000 }), (_req, res) => {
    res.json({ ok: true });
  });
  app.use(errorHandler);
  return app;
}

describe('login rate limiter', () => {
  it('allows requests up to the limit, then returns 429 RATE_LIMITED', async () => {
    const app = appWithLimit(2);
    expect((await request(app).post('/login').send({})).status).toBe(200);
    expect((await request(app).post('/login').send({})).status).toBe(200);

    const blocked = await request(app).post('/login').send({});
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe('RATE_LIMITED');
  });
});
