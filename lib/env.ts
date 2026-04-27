/*
 * Runtime env guards. Imported by auth and middleware so a missing
 * required secret fails LOUDLY and EARLY rather than silently allowing
 * a forged token through `|| 'dev-secret-change-me'` in production.
 */

const DEV_FALLBACK_SECRET = 'dev-secret-change-me-locally-only';

let warned = false;

/**
 * Returns the auth secret. Auth.js v5 prefers AUTH_SECRET; we still
 * accept NEXTAUTH_SECRET for backward-compat with deploys that haven't
 * been rotated yet. In development, falls back to a fixed dev value
 * and logs a one-time warning. In production, throws if neither is set.
 */
export function requireAuthSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'AUTH_SECRET (or legacy NEXTAUTH_SECRET) is required in production. ' +
      'Generate one with `openssl rand -base64 32` and set it in your deploy env.'
    );
  }
  if (!warned) {
    console.warn('[auth] AUTH_SECRET / NEXTAUTH_SECRET unset — using dev fallback. Set it before deploying.');
    warned = true;
  }
  return DEV_FALLBACK_SECRET;
}

let upstashWarned = false;

/**
 * Warns if exactly one of the Upstash env vars is set. Both must be
 * present for the distributed rate-limit backend to engage; with only
 * one set, lib/rate-limit.ts silently falls back to the in-memory
 * bucket — and on a multi-instance deploy that means each instance
 * keeps its own count, so the effective limit is `capacity * instances`.
 *
 * Idempotent: only logs once per process. In production, escalates the
 * message to error level so it shows up in monitoring dashboards.
 */
export function checkUpstashConfig(): void {
  if (upstashWarned) return;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (Boolean(url) === Boolean(token)) return; // both set or both unset → fine
  upstashWarned = true;
  const missing = url ? 'UPSTASH_REDIS_REST_TOKEN' : 'UPSTASH_REDIS_REST_URL';
  const msg =
    `${missing} is not set — Upstash rate limiting is disabled. ` +
    'Set both vars or neither so every instance shares state.';
  if (process.env.NODE_ENV === 'production') {
    console.error(`[env] ${msg}`);
  } else {
    console.warn(`[env] ${msg}`);
  }
}
