// Shared guard for CMS-admin API routes.
// Accepts either an authenticated NextAuth session OR the legacy
// x-cms-token header (kept so scripts and the existing dashboard still work).

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { AdminAuthResult } from '@/lib/types';
import type { NextRequest } from 'next/server';

export async function isAdmin(req: NextRequest | Request): Promise<AdminAuthResult | null> {
  const token = req.headers.get('x-cms-token');
  if (process.env.CMS_TOKEN && token === process.env.CMS_TOKEN) return { via: 'token' };

  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role === 'admin') {
    return { via: 'session', user: session!.user as AdminAuthResult['user'] };
  }

  return null;
}
