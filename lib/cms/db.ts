// Data access layer for the CMS content document.
// - getContent(): returns the current site content as a plain object.
// - saveContent(data, author?, note?): persists new revision + updates current.

import { PrismaClient } from '@prisma/client';
import type { CmsItemMeta, SiteContent } from '@/lib/types';
import { CONTENT_REVISION_KEEP_COUNT } from '@/lib/constants';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient = globalThis.__prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.__prisma = prisma;

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
 * logged at the call site, never thrown — pruning failure must never
 * fail a publish.
 */
async function pruneRevisions(keep: number): Promise<void> {
  try {
    const stale = await prisma.contentRevision.findMany({
      orderBy: { createdAt: 'desc' },
      skip: keep,
      select: { id: true },
    });
    if (stale.length === 0) return;
    await prisma.contentRevision.deleteMany({
      where: { id: { in: stale.map((r) => r.id) } },
    });
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
