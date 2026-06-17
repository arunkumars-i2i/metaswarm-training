/**
 * Auth routes (T031). POST /api/auth/login: validate → rate-limit → authenticate.
 * Validation failures become 400 VALIDATION_ERROR (distinct from the 401 auth error).
 * Logout (WU4) and /me (WU5) are added to this router later.
 */
import { Router, type Request, type Response, type NextFunction } from 'express';
import { loginSchema } from '../validation/auth.schema.js';
import { authService } from '../services/auth.service.js';
import { createLoginRateLimiter } from '../middleware/rate-limit.js';
import { validationError, type ErrorDetail } from '../middleware/error-handler.js';

export const authRouter = Router();

authRouter.post(
  '/login',
  createLoginRateLimiter(),
  (req: Request, res: Response, next: NextFunction) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const details: ErrorDetail[] = parsed.error.issues.map((i) => ({
        field: i.path.join('.') || 'body',
        message: i.message,
      }));
      next(validationError('Invalid login request.', details));
      return;
    }

    authService
      .login(parsed.data)
      .then((result) => res.status(200).json(result))
      .catch(next);
  },
);
