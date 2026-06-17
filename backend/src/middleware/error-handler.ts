/**
 * Consistent error responses (T014). All errors serialize to:
 *   { "error": { "code": string, "message": string, "details": [] } }
 * (contracts/auth-api.md). Never leak internals, stack traces, or password material.
 */
import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';

export interface ErrorDetail {
  field: string;
  message: string;
}

/** Application error carrying an HTTP status, a stable code, and optional field details. */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ErrorDetail[];

  constructor(status: number, code: string, message: string, details: ErrorDetail[] = []) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** 400 — input failed validation. */
export const validationError = (message: string, details: ErrorDetail[] = []): AppError =>
  new AppError(400, 'VALIDATION_ERROR', message, details);

/** 401 — login authentication failed. Generic; never reveals which field (FR-007). */
export const invalidCredentials = (): AppError =>
  new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');

/** 401 — missing/invalid/expired token on a protected request (FR-009, FR-010). */
export const unauthorized = (): AppError =>
  new AppError(401, 'UNAUTHORIZED', 'Authentication required.');

/** 429 — too many login attempts (FR-012). */
export const rateLimited = (): AppError =>
  new AppError(429, 'RATE_LIMITED', 'Too many attempts. Please try again later.');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  // Unknown error — do not leak details.
  console.error('[unhandled error]', err);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.', details: [] },
  });
};
