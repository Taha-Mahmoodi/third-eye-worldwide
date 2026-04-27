'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartLineUp,
  Database,
  HandHeart,
  Users,
} from '@/components/icons';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

/*
 * Sidebar navigation for the new Next.js dashboard. Each link is a
 * route under app/admin/(dashboard)/ — the (dashboard) route group
 * doesn't show up in the URL.
 *
 * usePathname starts with /admin/* so the Overview link is special-
 * cased: only `/admin` (or trailing slash) counts as active, otherwise
 * /admin/volunteers would match it via prefix.
 */

interface NavItem {
  href: string;
  label: string;
  icon: PhosphorIcon;
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: ChartLineUp },
  { href: '/admin/volunteers', label: 'Volunteers', icon: Users },
  { href: '/admin/donations', label: 'Donations', icon: HandHeart },
  { href: '/admin/content', label: 'Content', icon: Database },
];

function isActive(href: string, pathname: string | null): boolean {
  if (!pathname) return false;
  if (href === '/admin') return pathname === '/admin' || pathname === '/admin/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="adm-nav" aria-label="Admin navigation">
      <ul>
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`adm-nav-link${active ? ' active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size="1.05em" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
