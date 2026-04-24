#!/bin/sh
# Runs inside the runtime container BEFORE `node server.js`.
# Idempotent: safe to run on every container start. Migrate-deploy only
# applies unapplied migrations; seed only inserts if the SiteContent row
# isn't there yet (the seed script itself is idempotent).
set -eu

echo "[entrypoint] applying Prisma migrations..."
npx prisma migrate deploy

# Only seed if the site content row is missing. A subsequent admin publish
# via the CMS will bump revisions but not re-seed.
echo "[entrypoint] checking seed state..."
SEED_NEEDED=$(node -e "
  const { PrismaClient } = require('@prisma/client');
  const c = new PrismaClient();
  c.siteContent.findUnique({ where: { id: 1 } })
    .then(r => { console.log(r ? 'no' : 'yes'); return c.\$disconnect(); })
    .catch(() => { console.log('yes'); });
") || SEED_NEEDED=yes

if [ "$SEED_NEEDED" = "yes" ]; then
  echo "[entrypoint] seeding initial content + admin user..."
  node prisma/seed.mjs
else
  echo "[entrypoint] seed skipped (already populated)"
fi

echo "[entrypoint] starting Next server on :${PORT:-3000}"
exec "$@"
