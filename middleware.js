// Next.js middleware: session-gates /admin (except /admin/login).
// JWT cookie check — does not hit the DB, runs on the edge.

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Always allow the login page and NextAuth API itself
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) return NextResponse.next();
  if (pathname.startsWith('/api/auth')) return NextResponse.next();

  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');
  if (!isAdminPath) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || 'dev-secret-change-me',
  });
  if (token?.role === 'admin') return NextResponse.next();

  const loginUrl = new URL('/admin/login', req.url);
  loginUrl.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
