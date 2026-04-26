// NextAuth v4 configuration with credentials provider backed by Prisma User table.
// Used by the /api/auth/[...nextauth] route and by server components / API routes
// that need to check `getServerSession(authOptions)`.

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { prisma } from '@/lib/cms/db';
import { requireAuthSecret } from '@/lib/env';
import {
  SESSION_MAX_AGE_SECONDS,
  LOGIN_RATE_LIMIT_MAX_REQUESTS,
  LOGIN_RATE_LIMIT_WINDOW_MS,
} from '@/lib/constants';
import { checkAsync } from '@/lib/rate-limit';
import logger from '@/lib/logger';

/**
 * Pull a header value from either a Headers instance (Web) or a plain
 * object (NextAuth v4's `authorize(credentials, req)` provides plain
 * objects in some adapter versions). Returns null if missing.
 */
function pickHeader(headers: unknown, name: string): string | null {
  if (!headers) return null;
  const h = headers as { get?: (k: string) => string | null } & Record<string, unknown>;
  if (typeof h.get === 'function') return h.get(name) ?? null;
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(h)) {
    if (k.toLowerCase() === lower) return typeof v === 'string' ? v : null;
  }
  return null;
}

/** Best-effort IP from the auth request — same precedence as lib/rate-limit. */
function authReqIp(req: unknown): string {
  const headers = (req as { headers?: unknown } | undefined)?.headers;
  const xff = pickHeader(headers, 'x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const real = pickHeader(headers, 'x-real-ip');
  if (real) return real;
  return '0.0.0.0';
}

// Exported for test coverage (tests/unit/auth.test.ts).
export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored || !password) return false;
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  try {
    const want = Buffer.from(hash, 'hex');
    const got = scryptSync(password, salt, 64);
    return want.length === got.length && timingSafeEqual(want, got);
  } catch {
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: SESSION_MAX_AGE_SECONDS },
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'Email + password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase().trim();
        const ip = authReqIp(req);

        // MED-3: tight rate limit on the credentials path. Bucket key
        // is `ip:email` so a shared NAT can still log distinct accounts
        // in. 5 attempts per 15 minutes is enough to recover from a
        // typo'd password without giving an attacker meaningful
        // brute-force throughput.
        const rl = await checkAsync(`login:${ip}:${email}`, {
          capacity: LOGIN_RATE_LIMIT_MAX_REQUESTS,
          refillIntervalMs: LOGIN_RATE_LIMIT_WINDOW_MS,
        });
        if (!rl.allowed) {
          logger.warn({ event: 'rate_limited', ip, endpoint: 'login', email });
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !verifyPassword(credentials.password, user.passwordHash)) {
          logger.warn({ event: 'auth_failed', ip, email });
          return null;
        }

        logger.info({ event: 'auth_success', email });
        return {
          id: String(user.id),
          email: user.email,
          name: user.name || user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as { id: string; role?: string };
        token.uid = u.id;
        token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const su = session.user as { id?: string; role?: string };
        su.id = token.uid as string;
        su.role = token.role as string;
      }
      return session;
    },
  },
  secret: requireAuthSecret(),
};
