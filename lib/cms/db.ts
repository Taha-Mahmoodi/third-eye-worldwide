// Data access layer for the CMS content document.
// - getContent(): returns the current site content as a plain object.
// - saveContent(data, author?, note?): persists new revision + updates current.

import { PrismaClient } from '@prisma/client';
import type { CmsItemMeta, SiteContent } from '@/lib/types';

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
}

// Utility to filter an array-of-items collection by visibility + sort by `order`.
export function visibleSorted<T extends CmsItemMeta>(items: unknown): T[] {
  if (!Array.isArray(items)) return [];
  return (items as T[])
    .filter((it): it is T => Boolean(it) && it.visible !== false)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
