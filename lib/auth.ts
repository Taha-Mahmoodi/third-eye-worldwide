// NextAuth v4 configuration with credentials provider backed by Prisma User table.
// Used by the /api/auth/[...nextauth] route and by server components / API routes
// that need to check `getServerSession(authOptions)`.

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { prisma } from '@/lib/cms/db';
import { requireAuthSecret } from '@/lib/env';

function verifyPassword(password: string, stored: string | null | undefined): boolean {
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
  session: { strategy: 'jwt', maxAge: 60 * 60 * 12 },
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'Email + password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user) return null;
        if (!verifyPassword(credentials.password, user.passwordHash)) return null;
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
