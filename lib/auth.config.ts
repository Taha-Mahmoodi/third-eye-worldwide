/**
 * Edge-safe slice of the Auth.js config.
 *
 * Used by middleware.ts (which runs on the edge runtime where node:
 * built-ins like crypto, fs are unavailable). Holds only pages, the
 * session strategy, and the JWT/session callbacks — no provider that
 * pulls scrypt or Prisma.
 *
 * The full config in lib/auth.ts spreads this then adds the
 * Credentials provider + secret. See the Auth.js v5 docs:
 *   https://authjs.dev/getting-started/migrating-to-v5#edge-compatibility
 */

import type { NextAuthConfig } from 'next-auth';
import { SESSION_MAX_AGE_SECONDS } from '@/lib/constants';

export const authConfig = {
  session: { strategy: 'jwt', maxAge: SESSION_MAX_AGE_SECONDS },
  pages: { signIn: '/admin/login' },
  trustHost: true,
  // No providers here — credentials needs scrypt which is node-only.
  providers: [],
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
} satisfies NextAuthConfig;
