import { describe, expect, it } from 'vitest';
import { check, requestIp } from '@/lib/rate-limit';

/**
 * Token-bucket behavior. Each test uses a unique key so the buckets
 * stay isolated and the order tests run in doesn't matter.
 */

describe('check (in-memory token bucket)', () => {
  it('allows the first N requests under the cap', () => {
    const key = `t1:${Math.random()}`;
    const cap = 3;
    for (let i = 0; i < cap; i++) {
      const r = check(key, { capacity: cap, refillIntervalMs: 60_000 });
      expect(r.allowed, `req ${i + 1} should be allowed`).toBe(true);
    }
  });

  it('rejects request N+1 with retryAfter > 0', () => {
    const key = `t2:${Math.random()}`;
    const cap = 2;
    check(key, { capacity: cap, refillIntervalMs: 60_000 });
    check(key, { capacity: cap, refillIntervalMs: 60_000 });
    const blocked = check(key, { capacity: cap, refillIntervalMs: 60_000 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
    expect(blocked.remaining).toBe(0);
  });

  it('refills tokens proportional to elapsed time', async () => {
    const key = `t3:${Math.random()}`;
    const cap = 1;
    // 100 ms window — refills 1 token / 100 ms.
    const opts = { capacity: cap, refillIntervalMs: 100 };
    expect(check(key, opts).allowed).toBe(true);
    expect(check(key, opts).allowed).toBe(false); // cap consumed
    await new Promise((r) => setTimeout(r, 130));
    expect(check(key, opts).allowed).toBe(true); // refilled
  });

  it('treats independent keys as independent buckets', () => {
    const a = `t4a:${Math.random()}`;
    const b = `t4b:${Math.random()}`;
    const opts = { capacity: 1, refillIntervalMs: 60_000 };
    expect(check(a, opts).allowed).toBe(true);
    // a is now empty
    expect(check(a, opts).allowed).toBe(false);
    // b has its own bucket
    expect(check(b, opts).allowed).toBe(true);
  });

  it('returns a non-negative integer for `remaining`', () => {
    const key = `t5:${Math.random()}`;
    const r = check(key, { capacity: 5, refillIntervalMs: 60_000 });
    expect(r.remaining).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(r.remaining)).toBe(true);
  });
});

describe('requestIp', () => {
  function fakeReq(headers: Record<string, string | null>) {
    return {
      headers: {
        get: (name: string) => headers[name.toLowerCase()] ?? null,
      },
    };
  }

  it('prefers x-forwarded-for, taking the first entry', () => {
    expect(requestIp(fakeReq({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }))).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip when xff is absent', () => {
    expect(requestIp(fakeReq({ 'x-real-ip': '9.9.9.9' }))).toBe('9.9.9.9');
  });

  it('returns 0.0.0.0 when no header is present', () => {
    expect(requestIp(fakeReq({}))).toBe('0.0.0.0');
  });

  it('survives a request with no headers object at all', () => {
    expect(requestIp({} as unknown as Parameters<typeof requestIp>[0])).toBe('0.0.0.0');
  });
});
