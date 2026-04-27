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
