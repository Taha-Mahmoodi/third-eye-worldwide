// Shared guard for CMS-admin API routes.
// Accepts either an authenticated NextAuth session OR the legacy
// x-cms-token header (kept so scripts and the existing dashboard still work).

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function isAdmin(req) {
  const token = req.headers.get('x-cms-token');
  if (process.env.CMS_TOKEN && token === process.env.CMS_TOKEN) return { via: 'token' };

  const session = await getServerSession(authOptions);
  if (session?.user?.role === 'admin') return { via: 'session', user: session.user };

  return null;
}
