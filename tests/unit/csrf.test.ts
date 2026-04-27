import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { isAllowedOrigin, tripsHoneypot, HONEYPOT_FIELD } from '@/lib/csrf';

/**
 * The volunteer/donation tests already cover CSRF behaviour at the
 * route level. This file isolates the helpers themselves so the
 * security-critical truth tables are pinned by name.
 */

const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

function req(headers: Record<string, string>): NextRequest {
  return new NextRequest('http://localhost:3000/api/test', {
    method: 'POST',
    headers,
  });
}

afterEach(() => {
  if (ORIGINAL_SITE_URL === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE_URL;
});

describe('isAllowedOrigin', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://teww.org';
  });

  it('accepts a request with no Origin header (curl, server-side)', () => {
    expect(isAllowedOrigin(req({ host: 'teww.org' }))).toBe(true);
  });

  it('accepts an Origin matching NEXT_PUBLIC_SITE_URL', () => {
    expect(
      isAllowedOrigin(req({ origin: 'https://teww.org', host: 'teww.org' })),
    ).toBe(true);
  });

  it('accepts an Origin matching the request Host (dev / proxy fallback)', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(
      isAllowedOrigin(req({ origin: 'http://localhost:3000', host: 'localhost:3000' })),
    ).toBe(true);
  });

  it('rejects a cross-origin request', () => {
    expect(
      isAllowedOrigin(req({ origin: 'https://evil.example', host: 'teww.org' })),
    ).toBe(false);
  });

  it('rejects a near-match origin (subdomain spoof)', () => {
    expect(
      isAllowedOrigin(req({ origin: 'https://evil.teww.org.attacker.com', host: 'teww.org' })),
    ).toBe(false);
  });

  it('honours x-forwarded-proto when constructing the host-derived origin', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    // Behind a proxy that forwards as https — request comes in over http
    // internally but Origin header is the public https one.
    expect(
      isAllowedOrigin(
        req({ origin: 'https://teww.org', host: 'teww.org', 'x-forwarded-proto': 'https' }),
      ),
    ).toBe(true);
  });
});

describe('tripsHoneypot', () => {
  it('returns true when the honeypot field has content', () => {
    expect(tripsHoneypot({ [HONEYPOT_FIELD]: 'http://spam.example' })).toBe(true);
  });

  it('returns false when the honeypot field is missing', () => {
    expect(tripsHoneypot({ name: 'Jane' })).toBe(false);
  });

  it('returns false when the honeypot field is empty string', () => {
    expect(tripsHoneypot({ [HONEYPOT_FIELD]: '' })).toBe(false);
  });

  it('returns false when the honeypot field is whitespace only', () => {
    expect(tripsHoneypot({ [HONEYPOT_FIELD]: '   ' })).toBe(false);
  });

  it('returns false on null / undefined / non-object inputs', () => {
    expect(tripsHoneypot(null)).toBe(false);
    expect(tripsHoneypot(undefined)).toBe(false);
    expect(tripsHoneypot('string-body')).toBe(false);
    expect(tripsHoneypot(42)).toBe(false);
  });

  it('returns false when honeypot field is a non-string type', () => {
    expect(tripsHoneypot({ [HONEYPOT_FIELD]: 123 })).toBe(false);
    expect(tripsHoneypot({ [HONEYPOT_FIELD]: true })).toBe(false);
  });
});
