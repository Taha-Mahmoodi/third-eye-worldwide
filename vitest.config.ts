import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * Vitest config for the test suite added in CRIT-1.
 *
 * Tests live under tests/, organised by layer:
 *   tests/unit       — pure functions (validators, helpers)
 *   tests/api        — route handlers driven via fetch-style requests
 *
 * The `jsdom` environment is needed for any future component tests
 * even though the seed unit tests don't touch the DOM.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
