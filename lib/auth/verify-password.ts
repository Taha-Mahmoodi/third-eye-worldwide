/**
 * Scrypt + timing-safe password verification.
 *
 * Lives in its own file (not lib/auth.ts) so unit tests can import it
 * without pulling the full next-auth machinery. The auth config in
 * lib/auth.ts re-exports this.
 */

import { scryptSync, timingSafeEqual } from 'node:crypto';

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored || !password) return false;
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  try {
    const want = Buffer.from(hash, 'hex');
    const got = scryptSync(password, salt, 64);
    return want.length === got.length && timingSafeEqual(want, got);
  } catch {
    return false;
  }
}
