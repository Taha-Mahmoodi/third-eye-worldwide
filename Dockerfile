# syntax=docker/dockerfile:1.7
# ──────────────────────────────────────────────────────────────────────
# Third Eye Worldwide — production image
#
# Multi-stage build → slim runtime:
#   1) deps      install only the production dependency graph
#   2) builder   install dev deps, generate Prisma client, run next build
#   3) runtime   Alpine + node-slim copy of .next/standalone + Prisma
#
# Final image size target: ~170 MB.
# ──────────────────────────────────────────────────────────────────────

# ── 1. deps ────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ── 2. builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
# Generate Prisma client AND emit a standalone Next build.
# DATABASE_URL is only needed at runtime; a dummy value keeps Prisma happy
# for schema/client generation during build.
ENV DATABASE_URL="file:./build-placeholder.db"
RUN npx prisma generate && npm run build

# ── 3. runtime ────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat openssl tini \
  && addgroup --system --gid 1001 nodejs \
  && adduser  --system --uid 1001 nextjs

# App code (standalone bundle + static assets + public)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public          ./public

# Prisma artefacts for runtime migrations + seeding
COPY --from=builder --chown=nextjs:nodejs /app/prisma          ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/data ./data

# Seed data (used by prisma/seed.mjs). Keep out of standalone so it's
# available at runtime for `db:seed`.
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# ── Volume mount points (Dokploy / plain Docker) ────────────────
# /data persists across rebuilds; the host volume mounted there is
# the durable location for SQLite + media uploads. We:
#   - Create /data + /data/uploads so a fresh volume comes up valid.
#   - Replace the build-time public/uploads dir with a symlink into
#     /data/uploads so lib/media/local-disk.ts (which writes to
#     `path.join(process.cwd(), 'public', 'uploads')`) ends up
#     touching the volume without knowing about Docker.
# DATABASE_URL is expected at runtime to be `file:/data/prod.db`.
RUN mkdir -p /data/uploads \
  && chown -R 1001:1001 /data \
  && rm -rf /app/public/uploads \
  && ln -sfn /data/uploads /app/public/uploads
VOLUME ["/data"]

# Entrypoint that runs migrations + seeding on first start, then exec's
# the Next standalone server.
COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs
EXPOSE 3000

# Healthcheck — Dokploy / Docker Swarm / orchestrators use this to
# decide when the container is ready and to restart on failure.
# Uses Node 20's built-in fetch to avoid depending on busybox wget /
# curl quirks across base-image variants.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

# tini reaps zombies + forwards signals cleanly to node.
ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]
