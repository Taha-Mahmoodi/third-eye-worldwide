// Shared guard for CMS-admin API routes.
// Accepts either an authenticated NextAuth session OR the legacy
// x-cms-token header (kept so scripts and the existing dashboard still work).
//
// CMS_TOKEN env var stores a SHA-256 hex hash of the actual secret.
// At request time we hash the incoming header value and compare with
// timingSafeEqual. Plain-text comparison (===) leaked length and was
// vulnerable to timing-based oracles. See HIGH-5 in CODEBASE_REVIEW.md.
//
// Migration: existing deploys with a plain-text CMS_TOKEN will see
// token auth refused (with a one-time warn log) until the env value
// is rotated to a sha256 hex. Session auth continues to work.

import { getServerSession } from 'next-auth';
import { createHash, timingSafeEqual } from 'node:crypto';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/logger';
import type { AdminAuthResult } from '@/lib/types';
import type { NextRequest } from 'next/server';

const HEX64 = /^[0-9a-f]{64}$/i;

let warnedAboutPlaintext = false;
function warnPlaintextOnce() {
  if (warnedAboutPlaintext) return;
  warnedAboutPlaintext = true;
  logger.warn(
    { event: 'cms_token_plaintext' },
    'CMS_TOKEN is set but is not a 64-char hex SHA-256 hash. Token auth is refused; rotate the env var to the hashed form (see .env.example).',
  );
}

function tokenMatches(received: string, expectedSha256Hex: string): boolean {
  // Hash the incoming token, hex-decode the env value, compare both
  // 32-byte buffers in constant time.
  const receivedHash = createHash('sha256').update(received, 'utf8').digest();
  const expected = Buffer.from(expectedSha256Hex, 'hex');
  if (expected.length !== receivedHash.length) return false;
  try {
    return timingSafeEqual(receivedHash, expected);
  } catch {
    return false;
  }
}

export async function isAdmin(req: NextRequest | Request): Promise<AdminAuthResult | null> {
  const headerToken = req.headers.get('x-cms-token');
  const envToken = process.env.CMS_TOKEN;
  if (headerToken && envToken) {
    if (!HEX64.test(envToken)) {
      warnPlaintextOnce();
    } else if (tokenMatches(headerToken, envToken)) {
      return { via: 'token' };
    }
  }

  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role === 'admin') {
    return { via: 'session', user: session!.user as AdminAuthResult['user'] };
  }

  return null;
}
