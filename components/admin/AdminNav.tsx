'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartLineUp,
  Database,
  FileText,
  HandHeart,
  UserCircle,
  Users,
} from '@/components/icons';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

/*
 * Sidebar navigation for the dashboard. Items flagged `adminOnly`
 * are hidden when the signed-in user is an editor (CMS_ROADMAP PR #7).
 * The matching middleware rule still blocks direct URL hits, so the
 * gate is purely cosmetic — a confused editor doesn't see Users /
 * Audit log links they can't open.
 */

interface NavItem {
  href: string;
  label: string;
  icon: PhosphorIcon;
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: ChartLineUp },
  { href: '/admin/volunteers', label: 'Volunteers', icon: Users },
  { href: '/admin/donations', label: 'Donations', icon: HandHeart },
  { href: '/admin/content', label: 'Content', icon: Database },
  { href: '/admin/users', label: 'Users', icon: UserCircle, adminOnly: true },
  { href: '/admin/audit-log', label: 'Audit log', icon: FileText, adminOnly: true },
];

function isActive(href: string, pathname: string | null): boolean {
  if (!pathname) return false;
  if (href === '/admin') return pathname === '/admin' || pathname === '/admin/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export interface AdminNavProps {
  /** Role of the currently signed-in user. Falls back to 'editor'
   * defensively so admin-only items hide unless explicitly admin. */
  role?: string;
}

export default function AdminNav({ role = 'editor' }: AdminNavProps) {
  const pathname = usePathname();
  const items = NAV.filter((item) => !item.adminOnly || role === 'admin');
  return (
    <nav className="adm-nav" aria-label="Admin navigation">
      <ul>
        {items.map((item) => {
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
