import { redirect } from 'next/navigation';
import { prisma } from '@/lib/cms/db';
import { auth } from '@/lib/auth';
import UsersClient, { type UserRow } from '@/components/admin/UsersClient';

export const dynamic = 'force-dynamic';

/*
 * Admin-only page. The (dashboard) layout already gates editor; this
 * page additionally redirects editors back to /admin so an editor who
 * types the URL directly doesn't see the user list. Belt + braces
 * with the matching middleware rule.
 */
export default async function UsersAdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== 'admin') {
    redirect('/admin');
  }

  const callerId = Number.parseInt(
    (session?.user as { id?: string } | undefined)?.id ?? '',
    10,
  );

  const rows = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      lastLogin: true,
      createdAt: true,
    },
  });

  const serialized: UserRow[] = rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
    lastLogin: r.lastLogin ? r.lastLogin.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <UsersClient
      initialRows={serialized}
      callerId={Number.isFinite(callerId) ? callerId : null}
    />
  );
}
