// Data access layer for the CMS content document.
// - getContent(): returns the current site content as a plain object.
// - saveContent(data, author?, note?): persists new revision + updates current.

import { PrismaClient } from '@prisma/client';
import type { CmsItemMeta, SiteContent } from '@/lib/types';
import { CONTENT_REVISION_KEEP_COUNT } from '@/lib/constants';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __sqliteConfigured: boolean | undefined;
}

export const prisma: PrismaClient = globalThis.__prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.__prisma = prisma;

// SQLite-specific pragmas applied once per process. WAL allows concurrent
// readers alongside a writer (the default DELETE journal grabs an
// exclusive lock per write, so concurrent requests fail with
// SQLITE_BUSY). busy_timeout makes a queued write wait up to 5 s for
// the lock instead of failing instantly. synchronous=NORMAL is safe in
// WAL mode and halves fsync calls — switch to FULL if your hosting
// requires the extra durability guarantee.
//
// All three are no-ops when DATABASE_URL points at PostgreSQL (Prisma
// returns "unknown pragma" which we silently swallow), so this stays
// safe to run unconditionally.
if (!globalThis.__sqliteConfigured) {
  globalThis.__sqliteConfigured = true;
  void Promise.all([
    prisma.$executeRawUnsafe('PRAGMA journal_mode=WAL'),
    prisma.$executeRawUnsafe('PRAGMA busy_timeout=5000'),
    prisma.$executeRawUnsafe('PRAGMA synchronous=NORMAL'),
  ]).catch(() => {
    // Swallow — Postgres rejects PRAGMA, that's fine.
  });
}

export async function getContent(): Promise<SiteContent | null> {
  const row = await prisma.siteContent.findUnique({ where: { id: 1 } });
  if (!row) return null;
  try {
    return JSON.parse(row.data) as SiteContent;
  } catch {
    return null;
  }
}

export interface SaveContentOptions {
  author?: string | null;
  note?: string | null;
}

export async function saveContent(
  data: SiteContent,
  { author, note }: SaveContentOptions = {}
): Promise<void> {
  const payload = JSON.stringify({
    ...data,
    updatedAt: new Date().toISOString(),
  });
  await prisma.$transaction([
    prisma.contentRevision.create({
      data: { data: payload, author: author || null, note: note || null },
    }),
    prisma.siteContent.upsert({
      where: { id: 1 },
      update: { data: payload },
      create: { id: 1, data: payload },
    }),
  ]);

  // MED-4: keep only the most-recent N revisions. Each revision stores
  // a full content snapshot (~50 KB-2 MB), so without pruning the
  // table grew unbounded in proportion to publish frequency. We do this
  // outside the transaction above because (a) it's not atomic with the
  // publish (a stale read of older rows is harmless) and (b) Prisma
  // transactions can't reference results from earlier statements.
  await pruneRevisions(CONTENT_REVISION_KEEP_COUNT);
}

/**
 * Drop all but the `keep` most-recent ContentRevision rows. Errors are
 * swallowed — pruning failure must never fail a publish.
 *
 * Single atomic statement: deletes everything not in the top-N by
 * createdAt. The previous read-then-delete had a TOCTOU window — a
 * concurrent publish between the SELECT and DELETE could shift the
 * "freshest N" set so the wrong rows got deleted. The subquery here
 * runs in one statement so SQLite/Postgres see a consistent snapshot.
 */
async function pruneRevisions(keep: number): Promise<void> {
  try {
    await prisma.$executeRaw`
      DELETE FROM "ContentRevision"
      WHERE id NOT IN (
        SELECT id FROM "ContentRevision"
        ORDER BY "createdAt" DESC
        LIMIT ${keep}
      )
    `;
  } catch {
    // Swallow — pruning is best-effort. The publish succeeded already.
  }
}

// Utility to filter an array-of-items collection by visibility + sort by `order`.
export function visibleSorted<T extends CmsItemMeta>(items: unknown): T[] {
  if (!Array.isArray(items)) return [];
  return (items as T[])
    .filter((it): it is T => Boolean(it) && it.visible !== false)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
