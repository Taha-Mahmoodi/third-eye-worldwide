import { describe, expect, it, beforeEach } from 'vitest';
import {
  signConfirmationToken,
  verifyConfirmationToken,
} from '@/lib/email/token';

/**
 * The token signing/verification path is the security boundary for
 * the email confirmation feature. If this stops doing the right
 * thing, an attacker can confirm submissions they don't own.
 */

beforeEach(() => {
  // Stable secret for these tests. lib/env.ts reads AUTH_SECRET first
  // then falls back to NEXTAUTH_SECRET. Either works here.
  process.env.AUTH_SECRET = 'test-secret-32-chars-not-for-prod';
});

describe('confirmation token', () => {
  it('round-trips a freshly signed token', () => {
    const createdAt = new Date();
    const token = signConfirmationToken('volunteer', 1, createdAt);
    expect(verifyConfirmationToken('volunteer', 1, createdAt, token)).toEqual({ ok: true });
  });

  it('rejects when type does not match', () => {
    const createdAt = new Date();
    const token = signConfirmationToken('volunteer', 7, createdAt);
    // Same id + createdAt but signed for the OTHER type — sig mismatch.
    expect(
      verifyConfirmationToken('donation', 7, createdAt, token),
    ).toEqual({ ok: false, reason: 'tampered' });
  });

  it('rejects when id does not match', () => {
    const createdAt = new Date();
    const token = signConfirmationToken('volunteer', 1, createdAt);
    expect(
      verifyConfirmationToken('volunteer', 999, createdAt, token),
    ).toEqual({ ok: false, reason: 'tampered' });
  });

  it('rejects when row.createdAt does not match the token (forge attempt)', () => {
    // Attacker mints a token with the current time, but the row's
    // createdAt is something else — verifier must catch the mismatch.
    const tokenCreatedAt = new Date();
    const rowCreatedAt = new Date(tokenCreatedAt.getTime() - 60_000);
    const token = signConfirmationToken('volunteer', 1, tokenCreatedAt);
    expect(
      verifyConfirmationToken('volunteer', 1, rowCreatedAt, token),
    ).toEqual({ ok: false, reason: 'mismatch' });
  });

  it('rejects when the token is older than the TTL window', () => {
    // 25 hours ago — TTL is 24h.
    const createdAt = new Date(Date.now() - 25 * 60 * 60 * 1000);
    const token = signConfirmationToken('volunteer', 1, createdAt);
    expect(
      verifyConfirmationToken('volunteer', 1, createdAt, token),
    ).toEqual({ ok: false, reason: 'expired' });
  });

  it('rejects malformed tokens', () => {
    const createdAt = new Date();
    expect(verifyConfirmationToken('volunteer', 1, createdAt, '')).toEqual({
      ok: false, reason: 'malformed',
    });
    expect(
      verifyConfirmationToken('volunteer', 1, createdAt, 'not-a-real-token'),
    ).toMatchObject({ ok: false });
  });

  it('rejects when the signature has been tampered with', () => {
    const createdAt = new Date();
    const token = signConfirmationToken('volunteer', 42, createdAt);
    // Flip a character in the signature half. base64url-decode +
    // mutation guarantees a different signature byte.
    const decoded = Buffer.from(token.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
    const [ts, sig] = decoded.split(':');
    const tamperedSig = sig.slice(0, -2) + (sig.endsWith('00') ? 'ff' : '00');
    const tampered = Buffer.from(`${ts}:${tamperedSig}`).toString('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(
      verifyConfirmationToken('volunteer', 42, createdAt, tampered),
    ).toEqual({ ok: false, reason: 'tampered' });
  });

  it('rejects when AUTH_SECRET changes between sign and verify', () => {
    const createdAt = new Date();
    const token = signConfirmationToken('volunteer', 1, createdAt);
    process.env.AUTH_SECRET = 'a-different-secret-please-rotate-me';
    expect(
      verifyConfirmationToken('volunteer', 1, createdAt, token),
    ).toEqual({ ok: false, reason: 'tampered' });
  });
});
