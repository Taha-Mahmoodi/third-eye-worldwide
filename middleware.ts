// Next.js middleware: per-request CSP nonce + admin auth gate.
//
// CSP: every response gets a Content-Security-Policy header whose
// `script-src` includes a fresh per-request nonce. The nonce is
// forwarded to server components via the `x-nonce` request header
// so the inline theme-bootstrap <script> in app/layout.tsx can pick
// it up. Static `unsafe-inline` is gone — an injected script no
// longer runs by default.
//
// Auth gate (unchanged behavior): /admin/* requires role=admin in
// the JWT. /admin/login + /api/auth pass through. The earlier file
// did this on a tighter matcher; the matcher is broader now (every
// page needs a nonce) so the auth check is conditional on the path.

import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { requireAuthSecret } from '@/lib/env';

const { auth } = NextAuth({
  ...authConfig,
  secret: requireAuthSecret(),
});

function generateNonce(): string {
  // The Web Crypto API is available in the edge runtime.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: images.unsplash.com",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');
}

export default auth((req) => {
  const nonce = generateNonce();
  const { pathname } = req.nextUrl;
  const csp = buildCsp(nonce);

  // Forward the nonce to server components via a request header.
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set('x-nonce', nonce);

  // Admin auth gate. Login + Auth.js own routes always pass through.
  const isAuthBypass =
    pathname === '/admin/login' ||
    pathname.startsWith('/admin/login/') ||
    pathname.startsWith('/api/auth');
  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdminPath && !isAuthBypass) {
    // Auth.js v5: req.auth is the Session, not the raw JWT. The role
    // ends up on session.user (set by the session callback in
    // lib/auth.config.ts). See lib/cms/auth-guard.ts for the same
    // shape on the server side.
    const session = req.auth as { user?: { role?: string } } | null;
    const role = session?.user?.role;

    // Two tiers (CMS_ROADMAP PR #7):
    //   • Anyone without role admin/editor → bounce to login.
    //   • Editor on the admin-only routes (/admin/users,
    //     /admin/audit-log) → bounce back to /admin. The dashboard's
    //     sidebar already hides those links for editors but a typed
    //     URL would otherwise reach the page (where the per-page
    //     server gate would also redirect, but doing it at the edge
    //     saves a Prisma round-trip).
    if (role !== 'admin' && role !== 'editor') {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      const redirect = NextResponse.redirect(loginUrl);
      redirect.headers.set('Content-Security-Policy', csp);
      return redirect;
    }

    const isAdminOnlyPath =
      pathname === '/admin/users' ||
      pathname.startsWith('/admin/users/') ||
      pathname === '/admin/audit-log' ||
      pathname.startsWith('/admin/audit-log/');
    if (isAdminOnlyPath && role !== 'admin') {
      const home = new URL('/admin', req.url);
      const redirect = NextResponse.redirect(home);
      redirect.headers.set('Content-Security-Policy', csp);
      return redirect;
    }
  }

  const response = NextResponse.next({ request: { headers: reqHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
});

// Every page gets a nonce, not just /admin. Excludes static assets
// so `_next/static`, optimized images, and the favicon stay fast.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts/|assets/).*)'],
};
