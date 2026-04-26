/**
 * App-wide structured logger (pino).
 *
 * Use in API routes and any server-side code that needs durable
 * observability. `console.log` was unreliable in serverless because
 * lines were flushed inconsistently and you couldn't filter by
 * level or context.
 *
 * Usage:
 *   import logger from '@/lib/logger';
 *   logger.info({ event: 'volunteer_submitted', email, ip }, 'submission received');
 *   logger.warn({ event: 'rate_limited', ip, endpoint });
 *   logger.error({ err }, 'unexpected DB error');
 *
 * Convention for `event`:
 *   <subject>_<verb_past_tense>      e.g. cms_published, auth_failed
 *
 * Per HIGH-4 in CODEBASE_REVIEW.md.
 */

import pino, { type Logger } from 'pino';

const isDev = process.env.NODE_ENV === 'development';
const level = process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info');

// Note: we don't use the `pino-pretty` transport here. It runs in a
// thread-stream worker which Next.js's webpack hoist puts at a path
// that can't find its own dependencies, crashing the dev server. We
// emit JSON lines in every environment instead. To pretty-print
// locally, pipe at the shell:
//   npm run dev | npx pino-pretty
const logger: Logger = pino({
  level,
  // Strip obviously sensitive fields if they ever land in a log
  // payload. Belt-and-braces — we shouldn't pass these in the first
  // place but the redaction guarantees they don't slip out.
  redact: {
    paths: [
      'password',
      'pwd',
      'token',
      'authorization',
      'cookie',
      '*.password',
      '*.token',
      '*.authorization',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },
});

export default logger;
