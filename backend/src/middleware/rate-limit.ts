/**
 * Login rate limiting (T030, FR-012). Throttles repeated attempts per client IP and
 * returns 429 RATE_LIMITED via the shared error handler when the limit is exceeded.
 */
import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';
import { rateLimited } from './error-handler.js';

export interface RateLimiterOptions {
  /** Max requests per window per IP. */
  max?: number;
  /** Window length in milliseconds. */
  windowMs?: number;
}

const DEFAULT_MAX = 10;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function envMax(): number {
  const fromEnv = Number(process.env.RATE_LIMIT_LOGIN_MAX);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : DEFAULT_MAX;
}

export function createLoginRateLimiter(options: RateLimiterOptions = {}): RequestHandler {
  return rateLimit({
    windowMs: options.windowMs ?? DEFAULT_WINDOW_MS,
    max: options.max ?? envMax(),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(rateLimited());
    },
  });
}
