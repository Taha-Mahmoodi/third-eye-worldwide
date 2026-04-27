# Vercel + VPS deploy runbook

Frontend on **Vercel** (rendering, CDN, edge middleware), data on **your VPS** (Postgres + MinIO for media). The VPS exposes Postgres and S3-compatible blob storage publicly with TLS + auth so Vercel functions can talk to them over the public internet.

## What this branch ships

| Path | Purpose |
|---|---|
| `prisma/schema.prisma` | `provider = "postgresql"` instead of `"sqlite"` |
| `lib/media/s3.ts` | S3-compatible storage adapter (MinIO / R2 / S3 / B2) |
| `lib/media/index.ts` | Adapter factory now prefers S3 when `S3_ENDPOINT` is set |
| `next.config.mjs` | Adds the MinIO hostname to `images.remotePatterns` |
| `app/api/health/route.ts` | Health endpoint Vercel + UptimeRobot can poll |
| `package.json` | Adds `@aws-sdk/client-s3` |
| `vercel.json` | unchanged — Vercel Cron entry stays |
| `deploy/vercel-vps/RUNBOOK.md` | this file |

## Architecture

```
                  browsers
                     │
                     ▼
            ┌──────────────────┐
            │     Vercel       │  Next.js SSR + RSC + edge middleware
            │  (Pro plan       │  static assets, image optimisation
            │   recommended)   │  Vercel Cron → /api/cron/purge-pii
            └────────┬─────────┘
                     │ TLS over public internet
                     │
       ┌─────────────┼─────────────┐
       ▼                           ▼
 db.your-domain.com           media.your-domain.com
 ┌──────────────────┐         ┌─────────────────┐
 │  PgBouncer       │         │   MinIO         │
 │  → PostgreSQL    │         │   (S3-compat)   │
 └──────────────────┘         └─────────────────┘
                  ↑                    ↑
            ─── Caddy fronts both ───
            (Let's Encrypt + reverse proxy)

      Both run on the same single VPS
```

## Why this topology

| Pro | Con |
|---|---|
| Vercel handles edge cache, image optimisation, CDN, function cold starts. | Every DB query is a Vercel-region → VPS round-trip — pay 50-150 ms per query. |
| Data sovereignty — every byte of PII + media stays on your VPS. | Two services to operate (VPS + Vercel) instead of one. |
| Vercel free / hobby tier covers most NGO traffic. Pro tier ($20/mo) gets fixed egress IPs for tightening the VPS firewall. | If the VPS goes down, the site loses SSR (the `try/catch` around `getContent()` from PR #103 falls back to empty content rather than 500ing). |
| Next.js features that need Vercel Edge / Image Optimisation Just Work. | Postgres connection pool must be tuned for serverless via PgBouncer. |

If those trade-offs aren't worth it, see `deploy/vps-only/` (no
Vercel) or `deploy/dokploy-vps/` (Vercel ergonomics on your VPS).

## VPS provisioning

Tested on Debian 12.

### 1. Base hardening

Same as the [vps-only runbook](../vps-only/RUNBOOK.md#1-base-hardening-10-min) —
non-root user, SSH-key auth, `ufw` baseline.

After it: open the firewall for the data services as well:

```bash
ufw allow 6432/tcp comment 'PgBouncer (TLS)'
ufw allow 80/tcp                        # required for Caddy ACME challenge
ufw allow 443/tcp                       # MinIO + Caddy admin
```

If you upgrade to Vercel Pro and get fixed egress IPs, swap the `6432` rule
for an IP-allowlist (`ufw allow from <vercel-egress-ip> to any port 6432`).
On the Hobby tier IPs rotate; lean on TLS + strong passwords instead.

### 2. PostgreSQL + PgBouncer

```bash
apt install -y postgresql postgresql-contrib pgbouncer

# Create DB + role
sudo -u postgres createdb teww
sudo -u postgres psql -c "CREATE USER teww_app WITH PASSWORD '<long-random>';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE teww TO teww_app;"
sudo -u postgres psql -d teww -c "GRANT ALL ON SCHEMA public TO teww_app;"

# Postgres listens on localhost only — PgBouncer is the public face.
# /etc/postgresql/16/main/postgresql.conf:
listen_addresses = 'localhost'
ssl = on

# /etc/postgresql/16/main/pg_hba.conf:
hostssl all all 127.0.0.1/32 scram-sha-256

systemctl restart postgresql

# /etc/pgbouncer/pgbouncer.ini:
[databases]
teww = host=localhost port=5432 dbname=teww

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction          ; CRITICAL for serverless
max_client_conn = 200
default_pool_size = 25
server_tls_sslmode = require
client_tls_sslmode = require
client_tls_cert_file = /etc/pgbouncer/cert.pem
client_tls_key_file = /etc/pgbouncer/key.pem

systemctl restart pgbouncer
```

`userlist.txt` format: `"teww_app" "SCRAM-SHA-256$..."` — the SCRAM
hash from `pg_authid`. Generate it with:

```bash
sudo -u postgres psql -c "SELECT rolname, rolpassword FROM pg_authid WHERE rolname='teww_app';"
```

### 3. MinIO

```bash
# Single-binary install
wget https://dl.min.io/server/minio/release/linux-amd64/minio
install minio /usr/local/bin/

# Service config
useradd -r minio-user -s /sbin/nologin
mkdir -p /srv/minio/data
chown minio-user:minio-user /srv/minio/data

# /etc/default/minio
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=<long-random>
MINIO_VOLUMES=/srv/minio/data
MINIO_OPTS="--address :9000 --console-address :9001"

# /etc/systemd/system/minio.service — see MinIO docs for the standard unit
systemctl enable --now minio
```

After first start, log in to the console at `http://<vps-ip>:9001`,
create:

1. A bucket named `teww-media`.
2. An access key + secret key scoped to that bucket (read+write).
3. Set the bucket's anonymous access policy to **read-only** so
   public URLs work without signed URLs.

### 4. Caddy for TLS on both services

```bash
# Same install steps as the vps-only runbook step 3.
# /etc/caddy/Caddyfile:

{
    email admin@your-domain.com
}

media.your-domain.com {
    reverse_proxy localhost:9000
    # Long cache for hashed asset URLs.
    @assets path /teww-media/*
    header @assets Cache-Control "public, max-age=2592000, immutable"
}

# PgBouncer terminates its OWN TLS on port 6432 (raw Postgres
# protocol isn't HTTP, so Caddy can't proxy it). Add a stream
# block in Caddy if you want it on a custom hostname:
{
    layer4 {
        :6432 {
            @postgres tls sni db.your-domain.com
            route @postgres {
                proxy localhost:6432
            }
        }
    }
}

# (Or skip the layer4 block and just give PgBouncer its own
# public TLS cert via certbot directly.)
```

### 5. Initial schema migration

```bash
# On the VPS, as the teww user:
git clone https://github.com/Taha-Mahmoodi/third-eye-worldwide.git /tmp/teww-init
cd /tmp/teww-init
git checkout deploy/vercel-vps
npm install

# Drop the SQLite-flavoured migration history; Postgres needs fresh
# migrations generated against the new DB.
rm -rf prisma/migrations

# Generate the initial migration against the live Postgres DB.
DATABASE_URL="postgresql://teww_app:pass@localhost:5432/teww?sslmode=require" \
  npx prisma migrate dev --name init --skip-seed

# Seed admin + initial content.
DATABASE_URL="postgresql://teww_app:pass@localhost:5432/teww?sslmode=require" \
  CMS_ADMIN_EMAIL=you@your-domain.com \
  CMS_ADMIN_PASSWORD=<long-random> \
  node prisma/seed.mjs

# Commit the regenerated migrations directory back to the deploy/vercel-vps
# branch — Vercel needs them in the repo to apply on future deploys.
```

## Vercel project setup

### 1. Import the repo

Vercel → New Project → Import `Taha-Mahmoodi/third-eye-worldwide`.
Production branch: `deploy/vercel-vps` (or merge to `main` once
verified).

### 2. Environment variables

Project Settings → Environment Variables. Add for **Production**:

```dotenv
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://www.your-domain.com

# === database ===
# `pgbouncer=true` + `connection_limit=1` are critical for serverless.
DATABASE_URL=postgresql://teww_app:pass@db.your-domain.com:6432/teww?sslmode=require&pgbouncer=true&connection_limit=1

# === auth ===
AUTH_SECRET=                          # openssl rand -base64 32
NEXTAUTH_URL=https://www.your-domain.com

# CMS write-token API path (legacy, still supported).
CMS_TOKEN=                            # SHA-256 hex of the secret you actually pass

# === email ===
RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=hello@your-domain.com

# === cron ===
CRON_SECRET=                          # openssl rand -base64 32

# === media (MinIO on the VPS) ===
S3_ENDPOINT=https://media.your-domain.com
S3_ACCESS_KEY=                        # bucket-scoped key
S3_SECRET_KEY=                        # bucket-scoped secret
S3_BUCKET=teww-media
S3_PUBLIC_BASE=https://media.your-domain.com
S3_REGION=auto

# === optional: distributed rate limiting ===
# Run multiple Vercel regions? Set both Upstash vars or set neither.
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### 3. Domains

Add `www.your-domain.com` and `your-domain.com` in Project →
Domains. Vercel auto-fetches Let's Encrypt; add the `A` / `CNAME`
records they specify at your DNS provider.

### 4. Deploy

Push to `deploy/vercel-vps` → Vercel webhook fires → build runs.
The `vercel.json` cron entry registers automatically; Vercel hits
`/api/cron/purge-pii` monthly with `Authorization: Bearer
${CRON_SECRET}`.

### 5. First-deploy checks

```bash
# DB reachable from Vercel?
curl -fsS https://www.your-domain.com/api/health
# { "ok": true, "uptime": 12, "db_ms": 75 }

# Sign in works?
open https://www.your-domain.com/admin/login
# (use CMS_ADMIN_EMAIL + CMS_ADMIN_PASSWORD from earlier)

# Media upload works?
# In the dashboard → Media → drag a small image. It should land in
# the MinIO bucket (verify in MinIO Console at http://<vps>:9001)
# and render in the Media Browser.
```

## Backups (on the VPS)

Restic against an off-site target — backs up Postgres logical dump
+ MinIO data dir. Same shape as the vps-only runbook's restic setup,
extended for both stores:

```bash
# /usr/local/bin/teww-backup.sh
#!/bin/sh
set -eu
. /etc/restic/env
TS=$(date -u +%Y%m%dT%H%M%S)

# Postgres logical backup — round-trips cleanly across versions.
sudo -u postgres pg_dump --format=custom --file=/tmp/teww-${TS}.dump teww
restic backup /tmp/teww-${TS}.dump /srv/minio/data --tag nightly
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 12 --prune
rm /tmp/teww-${TS}.dump
```

systemd timer at 02:00 nightly. Same as the vps-only runbook.

## Rollback

- **App rollback:** Vercel Deployments tab → click prior → "Promote
  to Production". One-click, ~30s.
- **DB rollback:** restore from restic. Restic `restore` →
  `pg_restore` against a fresh DB → flip `DATABASE_URL` in Vercel.

## Operating cost

| Line item | Cost / mo |
|---|---|
| VPS (Hostinger 6 vCPU / 12 GB) | $6.72 |
| Vercel Hobby tier | $0 |
| Vercel Pro (recommended for fixed egress IPs) | $20 |
| Backblaze B2 (~10 GB) | <$0.10 |
| Domain | ~$1 |
| Resend (≤3k mails/mo) | $0 |
| **Total — Hobby** | **~$8/mo** |
| **Total — Pro** | **~$28/mo** |

Hobby is fine if you're OK with TLS-only protection on the VPS.
Pro becomes worthwhile if you want to firewall to specific Vercel
egress IPs and / or stay above the Hobby tier's bandwidth +
function-time caps once traffic grows.

## When to choose this branch

| You want… | Pick |
|---|---|
| Vercel's edge cache, image optimisation, CDN | **vercel-vps** |
| Data on your VPS for sovereignty / control | **vercel-vps** |
| Single-region, single-machine, simplest | **vps-only** |
| Self-hosted with Vercel-like UX | **dokploy-vps** |
