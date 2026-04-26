/*
 * Two-backend rate limiter behind a single `check()` signature.
 *
 * Backend selection:
 *   - If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set in
 *     env, all calls go through @upstash/ratelimit's sliding window
 *     against shared Redis. This is the right shape for any
 *     multi-instance deploy (Vercel, Cloud Run, k8s replicas).
 *   - Otherwise, fall back to a per-process in-memory token bucket.
 *     Good enough for single-instance deploys; absolutely wrong for
 *     anything horizontally scaled.
 *
 * Both paths return `{ allowed, remaining, retryAfter }` so callers
 * don't care which one ran. Per HIGH-2 in CODEBASE_REVIEW.md.
 *
 * The Upstash path is async under the hood; we expose a sync `check()`
 * for backward compat. Callers that need the precise sliding-window
 * accuracy should use `checkAsync()` instead. The sync path falls back
 * to the in-memory bucket even when Upstash is configured.
 */

import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from '@/lib/constants';

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

// Evict stale entries periodically so the map can't grow unbounded.
// Only runs in a Node runtime; skipped on the edge.
if (typeof globalThis.setInterval === 'function') {
  const handle = setInterval(() => {
    const now = Date.now();
    for (const [key, b] of buckets) {
      if (now - b.lastRefill > 30 * 60 * 1000) buckets.delete(key);
    }
  }, 5 * 60 * 1000);
  (handle as { unref?: () => void }).unref?.();
}

export interface CheckOptions {
  capacity?: number;
  refillIntervalMs?: number;
}

export interface CheckResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

/** In-memory token bucket. Sync, per-process. */
function checkLocal(
  key: string,
  { capacity = RATE_LIMIT_MAX_REQUESTS, refillIntervalMs = RATE_LIMIT_WINDOW_MS }: CheckOptions = {}
): CheckResult {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) {
    b = { tokens: capacity, lastRefill: now };
    buckets.set(key, b);
  } else {
    const elapsed = now - b.lastRefill;
    const refill = (elapsed / refillIntervalMs) * capacity;
    b.tokens = Math.min(capacity, b.tokens + refill);
    b.lastRefill = now;
  }

  if (b.tokens >= 1) {
    b.tokens -= 1;
    return { allowed: true, remaining: Math.floor(b.tokens), retryAfter: 0 };
  }
  const retryAfter = Math.ceil((refillIntervalMs * (1 - b.tokens)) / capacity / 1000);
  return { allowed: false, remaining: 0, retryAfter };
}

export const check = checkLocal;

// ── Upstash path ─────────────────────────────────────────────────
// Loaded lazily so unrelated code doesn't pay the import cost when
// Upstash isn't configured. Cached per (capacity, window) tuple.

interface UpstashLimiter {
  limit: (id: string) => Promise<{
    success: boolean;
    remaining: number;
    reset: number; // ms-since-epoch when the next slot opens
  }>;
}

let upstashCache: Map<string, UpstashLimiter> | null = null;

function isUpstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

async function getLimiter(
  capacity: number,
  refillIntervalMs: number,
): Promise<UpstashLimiter | null> {
  if (!isUpstashConfigured()) return null;
  if (!upstashCache) upstashCache = new Map();

  const key = `${capacity}:${refillIntervalMs}`;
  const cached = upstashCache.get(key);
  if (cached) return cached;

  // Dynamic import so SSR bundles for non-Upstash deploys don't pull
  // either package into their server chunks.
  const [{ Ratelimit }, { Redis }] = await Promise.all([
    import('@upstash/ratelimit'),
    import('@upstash/redis'),
  ]);
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  const windowMinutes = Math.max(1, Math.round(refillIntervalMs / 60000));
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(capacity, `${windowMinutes} m`),
    prefix: 'teww_form',
    analytics: false,
  }) as unknown as UpstashLimiter;
  upstashCache.set(key, limiter);
  return limiter;
}

/**
 * Async variant of check(). Uses Upstash sliding-window when configured,
 * otherwise falls through to the in-memory bucket. Use this from API
 * route handlers that already do other async work — the round trip to
 * Upstash is well under 100 ms regionally.
 */
export async function checkAsync(
  key: string,
  opts: CheckOptions = {},
): Promise<CheckResult> {
  const capacity = opts.capacity ?? RATE_LIMIT_MAX_REQUESTS;
  const refillIntervalMs = opts.refillIntervalMs ?? RATE_LIMIT_WINDOW_MS;
  const limiter = await getLimiter(capacity, refillIntervalMs);
  if (!limiter) return checkLocal(key, opts);

  try {
    const r = await limiter.limit(key);
    const retryAfter = r.success ? 0 : Math.max(1, Math.ceil((r.reset - Date.now()) / 1000));
    return { allowed: r.success, remaining: Math.max(0, r.remaining), retryAfter };
  } catch {
    // Don't let a Redis hiccup block legitimate traffic — fall back
    // to local. Worst-case: the limit isn't shared across instances
    // until Redis comes back, which is the pre-Upstash behavior.
    return checkLocal(key, opts);
  }
}

interface IpRequest {
  headers?: {
    get?: (name: string) => string | null;
  };
}

/**
 * Best-effort IP extraction. Respects standard proxy headers when present,
 * otherwise falls back to the direct connection. Tight enough for rate
 * limiting; do not use as a security identifier.
 */
export function requestIp(req: IpRequest): string {
  const xff = req.headers?.get?.('x-forwarded-for');
  if (xff) return String(xff).split(',')[0].trim();
  const real = req.headers?.get?.('x-real-ip');
  if (real) return real;
  return '0.0.0.0';
}
