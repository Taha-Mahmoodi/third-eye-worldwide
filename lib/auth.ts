// Auth.js v5 — full config. Pulls scrypt + Prisma so this module is
// node-only; the edge-safe slice for middleware lives in auth.config.ts.
//
// Migrated from next-auth v4 in MED-9.

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/cms/db';
import { requireAuthSecret } from '@/lib/env';
import {
  LOGIN_RATE_LIMIT_MAX_REQUESTS,
  LOGIN_RATE_LIMIT_WINDOW_MS,
} from '@/lib/constants';
import { checkAsync } from '@/lib/rate-limit';
import logger from '@/lib/logger';
import { verifyPassword } from '@/lib/auth/verify-password';
import { authConfig } from '@/lib/auth.config';

// Re-export so any caller that already imported `verifyPassword` from
// '@/lib/auth' keeps working. Tests should prefer the more direct
// import from '@/lib/auth/verify-password' to avoid pulling next-auth.
export { verifyPassword };

/** Best-effort IP from a Web Request. Same precedence as lib/rate-limit. */
function authReqIp(req: Request | undefined): string {
  if (!req) return '0.0.0.0';
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return '0.0.0.0';
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Feed the secret explicitly so deploys that only set the legacy
  // NEXTAUTH_SECRET keep working without env changes.
  secret: requireAuthSecret(),
  providers: [
    Credentials({
      name: 'Email + password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);
        const ip = authReqIp(request);

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
        if (!user || !verifyPassword(password, user.passwordHash)) {
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
});
