/**
 * scrypt password hashing — paired with verifyPassword in
 * `verify-password.ts`. Matches the format used by prisma/seed.mjs
 * so a seeded admin and a dashboard-created admin look identical
 * in the DB.
 *
 * Format: `${salt-hex}:${hash-hex}` with a 16-byte random salt and
 * a 64-byte scrypt output (default cost). N=2^14 is fine for
 * dashboard-rate auth; we never see hot-loop hashing here.
 */

import { randomBytes, scryptSync } from 'node:crypto';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
