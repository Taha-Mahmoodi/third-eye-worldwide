import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';
import SignOutButton from '@/components/admin/SignOutButton';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin · Third Eye Worldwide',
  robots: { index: false, follow: false },
};

/*
 * Server-side auth gate for every dashboard route. middleware.ts
 * already redirects unauthenticated requests to /admin/login, but the
 * gate here is the second line of defence — it covers the case where
 * the matcher misses or a future change exempts /admin from the
 * middleware. Defence-in-depth at the layout level is cheap.
 *
 * The dashboard CSS lives at app/admin/admin.css and is imported once
 * here so every (dashboard) child route gets it without re-importing.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== 'admin') {
    redirect('/admin/login?callbackUrl=/admin');
  }

  const userName = session?.user?.name || session?.user?.email || 'admin';

  return (
    <div className="adm-shell">
      <aside className="adm-sidebar" aria-label="Admin">
        <Link href="/admin" className="adm-brand">
          <span className="adm-brand-mark" aria-hidden="true">TE</span>
          <span className="adm-brand-text">TEWW CMS</span>
        </Link>
        <AdminNav />
        <div className="adm-sidebar-foot">
          <div className="adm-user" title={String(userName)}>
            {userName}
          </div>
          <SignOutButton />
        </div>
      </aside>
      {/* Use <section> rather than <main> — the public-site root
          layout already provides <main id="main">, so a nested <main>
          here would create duplicate landmark IDs and trip React's
          hydration check on the first client render. */}
      <section className="adm-main" aria-label="Admin content">
        {children}
      </section>
    </div>
  );
}
