import type { Config } from 'tailwindcss';

// T017 — Tailwind config. Default palette meets WCAG 2.1 AA contrast for the
// text/background pairings used in the login UI (constitution Principle V).
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
