/**
 * Server entry (T015). Loads validated env, then starts the HTTP listener.
 */
import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
