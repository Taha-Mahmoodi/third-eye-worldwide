/**
 * Confirmation-token signing + verification (MED-8).
 *
 * Token format:
 *   base64url(`${createdAtMs}:${signature}`)
 *
 * Where `signature` is HMAC-SHA256(`${type}.${id}.${createdAtMs}`)
 * keyed with AUTH_SECRET. The token is bound to a specific submission
 * (replay-safe), tamper-resistant (signature must verify), and
 * TTL-bound (createdAt must be within CONFIRMATION_TOKEN_TTL_MS).
 *
 * The verification path needs the row's actual `createdAt` from the DB
 * to confirm the token wasn't forged for a different row's id. See the
 * DEFERRED_PLAN.md MED-8 section for the full design rationale.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { CONFIRMATION_TOKEN_TTL_MS } from '@/lib/constants';
import { requireAuthSecret } from '@/lib/env';

export type SubmissionType = 'volunteer' | 'donation';

function b64urlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

function signature(type: SubmissionType, id: number, createdAtMs: number): string {
  const message = `${type}.${id}.${createdAtMs}`;
  return createHmac('sha256', requireAuthSecret()).update(message).digest('hex');
}

/** Mint a token for a specific submission. */
export function signConfirmationToken(
  type: SubmissionType,
  id: number,
  createdAt: Date,
): string {
  const t = createdAt.getTime();
  const sig = signature(type, id, t);
  return b64urlEncode(Buffer.from(`${t}:${sig}`, 'utf8'));
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: 'malformed' | 'expired' | 'mismatch' | 'tampered' };

/**
 * Verify a token against the row's actual `createdAt`. Returns ok:true
 * only if every check passes. Caller is responsible for looking up the
 * row first and passing its `createdAt`.
 */
export function verifyConfirmationToken(
  type: SubmissionType,
  id: number,
  createdAt: Date,
  token: string,
): VerifyResult {
  if (typeof token !== 'string' || token.length === 0 || token.length > 512) {
    return { ok: false, reason: 'malformed' };
  }

  let decoded: string;
  try {
    decoded = b64urlDecode(token).toString('utf8');
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  const idx = decoded.indexOf(':');
  if (idx <= 0 || idx === decoded.length - 1) {
    return { ok: false, reason: 'malformed' };
  }
  const tokenCreatedAt = Number(decoded.slice(0, idx));
  const tokenSig = decoded.slice(idx + 1);
  if (!Number.isFinite(tokenCreatedAt)) return { ok: false, reason: 'malformed' };

  // Token's embedded createdAt must match the row's createdAt. Stops
  // an attacker from minting a token with a fresh timestamp for an
  // arbitrary id they don't own.
  if (tokenCreatedAt !== createdAt.getTime()) {
    return { ok: false, reason: 'mismatch' };
  }

  // TTL window
  if (Date.now() - tokenCreatedAt > CONFIRMATION_TOKEN_TTL_MS) {
    return { ok: false, reason: 'expired' };
  }

  // Signature check, timing-safe
  const expected = Buffer.from(signature(type, id, tokenCreatedAt), 'hex');
  let received: Buffer;
  try {
    received = Buffer.from(tokenSig, 'hex');
  } catch {
    return { ok: false, reason: 'tampered' };
  }
  if (received.length !== expected.length) return { ok: false, reason: 'tampered' };
  if (!timingSafeEqual(received, expected)) return { ok: false, reason: 'tampered' };

  return { ok: true };
}
