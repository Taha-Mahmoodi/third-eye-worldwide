/**
 * CSRF defenses for the public form endpoints.
 *
 * - `isAllowedOrigin(req)` enforces a same-origin policy on POST/PUT
 *   without relying on env-var configuration. The check accepts a
 *   missing Origin header (some legitimate clients omit it) but
 *   rejects any Origin that doesn't match the request's own host
 *   or the explicitly-configured site URL.
 *
 * - `HONEYPOT_FIELD` is the name of a hidden form field that a
 *   real user can't see and a naive bot will gleefully fill in.
 *   The API treats any non-empty value here as a sign the request
 *   came from a script and silently drops it (returns 200 so the
 *   bot moves on).
 *
 * Per MED-1 in CODEBASE_REVIEW.md.
 */

import type { NextRequest } from 'next/server';

export const HONEYPOT_FIELD = 'website';

/** Returns true if the request's Origin header is acceptable. */
export function isAllowedOrigin(req: NextRequest | Request): boolean {
  const origin = req.headers.get('origin');
  // No Origin header at all — accept. Some legitimate clients
  // (curl scripts, server-side fetches) omit it.
  if (!origin) return true;

  const allowed = new Set<string>();

  // 1) Match the request's own host. This works in dev (localhost:3000)
  //    and prod (www.thirdeyeworldwide.org) without env config and
  //    survives any reverse-proxy that rewrites Host correctly.
  const host = req.headers.get('host');
  if (host) {
    const proto = req.headers.get('x-forwarded-proto') ?? 'http';
    allowed.add(`${proto}://${host}`);
    // Vercel and most proxies forward HTTPS; also include the
    // bare https form so a forwarded request with proto=http but
    // we know we're on https isn't accidentally rejected.
    allowed.add(`https://${host}`);
  }

  // 2) Match the explicitly-configured public URL. Belt-and-braces
  //    in case the Host header is forged behind an unhardened proxy.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    allowed.add(siteUrl.replace(/\/$/, ''));
  }

  return allowed.has(origin);
}

/**
 * Returns true if the body's honeypot field is present AND
 * non-empty — meaning the request was almost certainly automated.
 */
export function tripsHoneypot(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false;
  const v = (body as Record<string, unknown>)[HONEYPOT_FIELD];
  return typeof v === 'string' && v.trim().length > 0;
}
