/**
 * Express application bootstrap (T015). Wires JSON parsing, route mounting, and the
 * consistent error handler. The auth router is mounted under /api/auth in WU3.
 */
import express, { type Express } from 'express';
import { errorHandler } from './middleware/error-handler.js';

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  // Liveness probe (not a protected resource).
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Feature routers are mounted here (WU3 adds POST /api/auth/login, etc.).

  // Error handler MUST be registered last.
  app.use(errorHandler);

  return app;
}
