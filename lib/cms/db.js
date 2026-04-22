// Data access layer for the CMS content document.
// - getContent(): returns the current site content as a plain object.
// - saveContent(data, author?, note?): persists new revision + updates current.

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;
export const prisma = globalForPrisma.__prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.__prisma = prisma;

export async function getContent() {
  const row = await prisma.siteContent.findUnique({ where: { id: 1 } });
  if (!row) return null;
  try {
    return JSON.parse(row.data);
  } catch {
    return null;
  }
}

export async function saveContent(data, { author, note } = {}) {
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
export function visibleSorted(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((it) => it && it.visible !== false)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
