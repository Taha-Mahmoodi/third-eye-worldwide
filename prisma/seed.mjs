// Seed script: loads data/seed.json into the SiteContent row
// and creates an initial admin user.
// Run with: `npx prisma db seed` (configured in package.json).

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { scryptSync, randomBytes } from 'node:crypto';

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const seedPath = resolve(process.cwd(), 'data', 'seed.json');
  const raw = readFileSync(seedPath, 'utf-8');
  const parsed = JSON.parse(raw);

  // Normalize: add `visible: true` and `order: <index>` to every array item
  // so the CMS can toggle visibility and reorder without schema changes.
  function normalize(value) {
    if (Array.isArray(value)) {
      return value.map((item, i) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          return {
            visible: item.visible ?? true,
            order: item.order ?? i,
            ...normalize(item),
          };
        }
        return item;
      });
    }
    if (value && typeof value === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(value)) out[k] = normalize(v);
      return out;
    }
    return value;
  }
  const normalized = normalize(parsed);
  normalized.updatedAt = new Date().toISOString();

  await prisma.siteContent.upsert({
    where: { id: 1 },
    update: { data: JSON.stringify(normalized) },
    create: { id: 1, data: JSON.stringify(normalized) },
  });

  console.log('✓ Seeded SiteContent from data/seed.json');

  // Admin bootstrap
  const email = process.env.CMS_ADMIN_EMAIL || 'admin@teww.local';
  const password = process.env.CMS_ADMIN_PASSWORD || 'change-me';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        name: 'Admin',
        role: 'admin',
      },
    });
    console.log(`✓ Created admin user: ${email}`);
  } else {
    console.log(`• Admin user already exists: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
