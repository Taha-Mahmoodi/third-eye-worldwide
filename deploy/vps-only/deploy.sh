#!/usr/bin/env bash
#
# deploy/vps-only/deploy.sh
#
# Build locally, ship to the VPS, restart. Run from the repo root.
#
# Conventions:
#   - VPS is reachable as `ssh teww@your-vps` (key auth, no password).
#   - App lives at /srv/teww/app on the VPS.
#   - Persistent state (SQLite, uploads) lives at /srv/teww/data and
#     is symlinked into the app dir — rsync's `--delete` won't touch
#     it because we exclude the symlink targets.
#
# Usage:
#   VPS_HOST=teww@your-vps.example deploy/vps-only/deploy.sh
#
# CI variant: replace the rsync command with a tarball-over-SSH pipe
# so it works from a runner without persistent SSH keys.

set -euo pipefail

VPS_HOST="${VPS_HOST:-teww@your-vps.example}"
APP_DIR="/srv/teww/app"

echo ">> npm install (production deps will be re-pruned in build)"
npm install

echo ">> npm run build (produces .next/standalone)"
npm run build

echo ">> npx prisma generate (regenerate client for the deploy artifact)"
npx prisma generate

echo ">> rsync standalone build + supporting files to ${VPS_HOST}:${APP_DIR}"
# .next/standalone already contains a compact node_modules. We layer
# the static asset directories Next expects to find at runtime:
#   - .next/static is referenced by the standalone server.
#   - public/ is read at request time for static files.
# Prisma migrations + the generated client also need to ride along.
rsync -av --delete \
  --exclude='public/uploads/' \
  --exclude='prisma/dev.db*' \
  .next/standalone/ \
  "${VPS_HOST}:${APP_DIR}/"
rsync -av --delete \
  .next/static/ \
  "${VPS_HOST}:${APP_DIR}/.next/static/"
rsync -av --delete \
  --exclude='public/uploads/' \
  public/ \
  "${VPS_HOST}:${APP_DIR}/public/"
rsync -av \
  prisma/migrations/ \
  prisma/schema.prisma \
  "${VPS_HOST}:${APP_DIR}/prisma/"

echo ">> apply pending migrations on the VPS"
ssh "${VPS_HOST}" "cd ${APP_DIR} && npx prisma migrate deploy"

echo ">> restart the systemd unit"
ssh "${VPS_HOST}" "sudo systemctl restart teww"

echo ">> verify health endpoint"
sleep 2
ssh "${VPS_HOST}" "curl --fail --silent --show-error http://127.0.0.1:3000/api/health" \
  && echo ">> deploy OK"
