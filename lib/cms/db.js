// Static-build data layer. This branch ships a pre-rendered snapshot of the
// site, so there is no Prisma and no database. Content is read directly from
// the `data/seed.json` file at build time (cached in memory for the life of
// the Node build process).
//
// The public API is kept the same as the dynamic build so no page component
// needs to change:
//   - getContent(): returns the content document
//   - saveContent(): no-op in the static build (kept so imports don't break)
//   - visibleSorted(items): same filter+sort helper as the dynamic build
//
// To regenerate the static snapshot, re-run `npm run build`.

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

let cached = null;

export async function getContent() {
  if (cached) return cached;
  try {
    const path = resolve(process.cwd(), 'data', 'seed.json');
    const raw = await readFile(path, 'utf8');
    const parsed = JSON.parse(raw);
    // Normalize every array item to include `visible: true` and `order: i`
    // so visibleSorted() can treat the JSON shape identically to the DB
    // shape (which the Prisma seed script writes).
    cached = normalise(parsed);
    return cached;
  } catch (err) {
    // Don't crash the build over a missing seed — return an empty shell so
    // pages render their "No content yet" fallbacks instead of 500ing.
    // eslint-disable-next-line no-console
    console.warn('[static] Could not read data/seed.json:', err?.message || err);
    return null;
  }
}

// Static build never writes. Kept so any leftover imports don't throw.
export async function saveContent() {
  // eslint-disable-next-line no-console
  console.warn('[static] saveContent() is a no-op in the static build.');
}

// Same contract as the dynamic version — tolerate the DB-normalised shape
// (with `visible` + `order` injected by the seed script) AND the raw
// seed.json shape (where those fields are absent).
export function visibleSorted(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((it) => it && it.visible !== false)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// Walk the seed document and inject `visible: true` + `order: i` on every
// array-of-objects so `visibleSorted` treats the raw JSON like a DB read.
function normalise(value) {
  if (Array.isArray(value)) {
    return value.map((item, i) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        return {
          visible: item.visible ?? true,
          order: item.order ?? i,
          ...normalise(item),
        };
      }
      return item;
    });
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = normalise(v);
    return out;
  }
  return value;
}
