/**
 * Login request validation (T028). Enforces FR-002 (valid email), FR-003 (non-empty
 * password) and FR-011 (email normalized: trimmed + lower-cased) before any auth logic.
 */
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('A valid email address is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
