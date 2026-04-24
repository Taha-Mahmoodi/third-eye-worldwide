/*
 * Per-key in-memory token bucket.
 *
 * Good enough for single-instance deploys (Vercel/Netlify free tier,
 * a single Node container, etc). Multi-instance deploys need a
 * shared store — swap this for an Upstash Redis / Cloudflare KV
 * implementation behind the same `check()` signature.
 *
 * Usage:
 *   import { check } from '@/lib/rate-limit';
 *   const { allowed, retryAfter } = check(`submit:${ip}`, {
 *     capacity: 20, refillIntervalMs: 15 * 60 * 1000,
 *   });
 *   if (!allowed) return 429 with Retry-After: retryAfter
 */

const buckets = new Map();

// Evict stale entries periodically so the map can't grow unbounded.
// Only runs in a Node runtime; skipped on the edge.
if (typeof globalThis.setInterval === 'function') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, b] of buckets) {
      if (now - b.lastRefill > 30 * 60 * 1000) buckets.delete(key);
    }
  }, 5 * 60 * 1000).unref?.();
}

export function check(key, { capacity = 20, refillIntervalMs = 15 * 60 * 1000 } = {}) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) {
    b = { tokens: capacity, lastRefill: now };
    buckets.set(key, b);
  } else {
    // Continuous refill: tokens added proportional to time elapsed.
    const elapsed = now - b.lastRefill;
    const refill = (elapsed / refillIntervalMs) * capacity;
    b.tokens = Math.min(capacity, b.tokens + refill);
    b.lastRefill = now;
  }

  if (b.tokens >= 1) {
    b.tokens -= 1;
    return { allowed: true, remaining: Math.floor(b.tokens), retryAfter: 0 };
  }
  // Seconds until the bucket refills one token.
  const retryAfter = Math.ceil((refillIntervalMs * (1 - b.tokens)) / capacity / 1000);
  return { allowed: false, remaining: 0, retryAfter };
}

/**
 * Best-effort IP extraction. Respects standard proxy headers when present,
 * otherwise falls back to the direct connection. Tight enough for rate
 * limiting; do not use as a security identifier.
 */
export function requestIp(req) {
  const xff = req.headers?.get?.('x-forwarded-for');
  if (xff) return String(xff).split(',')[0].trim();
  const real = req.headers?.get?.('x-real-ip');
  if (real) return real;
  return '0.0.0.0';
}
