// Next.js middleware: session-gates /admin (except /admin/login).
//
// Auth.js v5 split: the edge runtime can't import lib/auth.ts directly
// (it pulls scrypt + Prisma). We instead mount NextAuth here against
// only the edge-safe slice in lib/auth.config.ts. The JWT cookie is
// still decoded by Auth.js — same DB-free behavior as the v4 getToken()
// call we used before.

import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { requireAuthSecret } from '@/lib/env';

const { auth } = NextAuth({
  ...authConfig,
  secret: requireAuthSecret(),
});

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Always allow the login page and Auth.js's own API surface.
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return NextResponse.next();
  }
  if (pathname.startsWith('/api/auth')) return NextResponse.next();

  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');
  if (!isAdminPath) return NextResponse.next();

  // req.auth comes from Auth.js after middleware decoded the JWT cookie.
  // Role lives on the token via the jwt callback in lib/auth.config.ts.
  const token = req.auth as { role?: string } | null;
  if (token?.role === 'admin') return NextResponse.next();

  const loginUrl = new URL('/admin/login', req.url);
  loginUrl.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
