/*
 * Runtime env guards. Imported by auth and middleware so a missing
 * required secret fails LOUDLY and EARLY rather than silently allowing
 * a forged token through `|| 'dev-secret-change-me'` in production.
 */

const DEV_FALLBACK_SECRET = 'dev-secret-change-me-locally-only';

/**
 * Returns NEXTAUTH_SECRET. In development, falls back to a fixed dev
 * value and logs a one-time warning. In production, throws if unset.
 */
export function requireAuthSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXTAUTH_SECRET is required in production. ' +
      'Generate one with `openssl rand -base64 32` and set it in your deploy env.'
    );
  }
  if (!requireAuthSecret._warned) {
    // eslint-disable-next-line no-console
    console.warn('[auth] NEXTAUTH_SECRET unset — using dev fallback. Set it before deploying.');
    requireAuthSecret._warned = true;
  }
  return DEV_FALLBACK_SECRET;
}
