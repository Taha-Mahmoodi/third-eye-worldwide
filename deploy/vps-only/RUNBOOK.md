# VPS-only deploy runbook

Self-hosted Next.js + SQLite + Caddy on a single Debian 12 VPS.
No Docker, no Vercel, no managed DB — one machine, systemd-managed
processes, file-on-disk database. Suitable for the sized
`6 vCPU / 12 GB RAM / 100 GB NVMe` plan; uses a small fraction of it.

## What this branch ships

| Path | Purpose |
|---|---|
| `deploy/vps-only/Caddyfile` | TLS termination + reverse proxy + static cache headers |
| `deploy/vps-only/teww.service` | systemd unit for the Next.js standalone server |
| `deploy/vps-only/teww-cron-purge.service` + `.timer` | replaces the old Vercel Cron entry |
| `deploy/vps-only/teww-backup.service` + `.timer` | restic-based nightly off-site backup |
| `deploy/vps-only/deploy.sh` | local build + rsync + restart |
| `app/api/health/route.ts` | health endpoint Caddy / monitoring can poll |
| `vercel.json` *(removed)* | not relevant any more |

## Architecture

```
            Internet (443)
                  │
                  ▼
            ┌────────────┐
            │  Caddy     │  /etc/caddy/Caddyfile, port 443/80
            │  (systemd) │  Lets-Encrypt TLS auto-renew
            └─────┬──────┘
                  │ reverse_proxy localhost:3000
                  │ /uploads/* served directly from disk
                  ▼
            ┌────────────┐
            │  Next.js   │  /srv/teww/app/server.js (standalone)
            │  (systemd) │  reads .env, talks to SQLite + disk
            └─────┬──────┘
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
 /srv/teww/data/        /srv/teww/app/public/uploads/
 prod.db (SQLite WAL)   (media, served by Caddy directly)
```

## VPS provisioning

Tested on Debian 12. All commands run as root unless noted.

### 1. Base hardening (~10 min)

```bash
apt update && apt full-upgrade -y
apt install -y ufw fail2ban unattended-upgrades curl git build-essential

# Non-root user
adduser teww
usermod -aG sudo teww

# SSH key auth only — drop in your public key first:
mkdir -p /home/teww/.ssh
echo 'ssh-ed25519 AAAA... your-key' > /home/teww/.ssh/authorized_keys
chown -R teww:teww /home/teww/.ssh
chmod 700 /home/teww/.ssh
chmod 600 /home/teww/.ssh/authorized_keys

# Disable password auth + root login
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart sshd

# Firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Auto-update kernel + security patches
dpkg-reconfigure -plow unattended-upgrades
```

### 2. Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v   # v20.x
```

### 3. Caddy

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key | tee /etc/apt/trusted.gpg.d/caddy-stable.asc
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install -y caddy

# Drop the Caddyfile from this repo into /etc/caddy/Caddyfile and
# replace `your-domain.com` + the ACME email.
cp /path/to/repo/deploy/vps-only/Caddyfile /etc/caddy/Caddyfile
$EDITOR /etc/caddy/Caddyfile
systemctl reload caddy
```

### 4. App layout + initial deploy

```bash
mkdir -p /srv/teww/{app,data,backups}
chown -R teww:teww /srv/teww

# Persistent state lives outside the app dir and is symlinked in.
# This way `rsync --delete` on a deploy can never wipe it.
mkdir -p /srv/teww/data
ln -sfn /srv/teww/data/prod.db /srv/teww/app/prisma/prod.db
ln -sfn /srv/teww/data/uploads /srv/teww/app/public/uploads
mkdir -p /srv/teww/data/uploads
chown -R teww:teww /srv/teww/data
```

### 5. Environment variables (`/srv/teww/app/.env`)

```dotenv
# === core ===
NODE_ENV=production
PORT=3000
HOSTNAME=127.0.0.1

# === database ===
DATABASE_URL=file:/srv/teww/data/prod.db

# === auth ===
AUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://www.your-domain.com
NEXT_PUBLIC_SITE_URL=https://www.your-domain.com

# CMS write-token API (legacy x-cms-token path, still supported)
# Set this to the SHA-256 hex of the secret you actually pass in headers.
CMS_TOKEN=<64-char hex>

# Initial admin user (only used by `prisma/seed.mjs` on first run).
CMS_ADMIN_EMAIL=you@your-domain.com
CMS_ADMIN_PASSWORD=<long random>

# === email ===
RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=hello@your-domain.com

# === cron ===
CRON_SECRET=<openssl rand -base64 32>
```

`chown teww:teww /srv/teww/app/.env && chmod 600` so only the
service user can read it.

### 6. systemd units

```bash
cp /path/to/repo/deploy/vps-only/teww.service /etc/systemd/system/
cp /path/to/repo/deploy/vps-only/teww-cron-purge.service /etc/systemd/system/
cp /path/to/repo/deploy/vps-only/teww-cron-purge.timer /etc/systemd/system/
cp /path/to/repo/deploy/vps-only/teww-backup.service /etc/systemd/system/
cp /path/to/repo/deploy/vps-only/teww-backup.timer /etc/systemd/system/

# Replace `your-domain.com` in the cron service file before enabling.
$EDITOR /etc/systemd/system/teww-cron-purge.service

systemctl daemon-reload
systemctl enable --now teww
systemctl enable --now teww-cron-purge.timer
systemctl enable --now teww-backup.timer
```

### 7. Backups

Pick an off-site target (Backblaze B2 free tier is fine):

```bash
apt install -y restic

# /etc/restic/env (chmod 600, root:root)
cat > /etc/restic/env <<'EOF'
RESTIC_REPOSITORY="b2:teww-backups:/main"
B2_ACCOUNT_ID="<key id>"
B2_ACCOUNT_KEY="<application key>"
RESTIC_PASSWORD="<long random>"
EOF
chmod 600 /etc/restic/env

# Init the repo once.
. /etc/restic/env && restic init

# The teww-backup.timer enabled above runs `restic backup` nightly.
```

Restore drill (do it once, write down the steps):

```bash
. /etc/restic/env
restic snapshots
restic restore <snapshot-id> --target /tmp/restore
# Stop the app, swap the DB + uploads, start again.
```

## Local deploy loop

After the VPS is set up, redeploys from a dev machine:

```bash
git pull
VPS_HOST=teww@your-vps.example deploy/vps-only/deploy.sh
```

The script builds locally, rsyncs `.next/standalone/`, `.next/static/`,
`public/`, and `prisma/`, runs `prisma migrate deploy` on the VPS,
restarts systemd, and pings the health endpoint. End-to-end ~30s for
a code-only change.

## DNS

```
A     your-domain.com           <vps-ip>
A     www.your-domain.com       <vps-ip>
TXT   @                         "v=spf1 include:_spf.resend.com ~all"
TXT   resend._domainkey         "<provided by Resend>"
TXT   _dmarc                    "v=DMARC1; p=quarantine; rua=mailto:dmarc@your-domain.com"
```

## Rollback

`teww.service` runs the contents of `/srv/teww/app`. To roll back to
the previous version, keep a `prev/` dir alongside `app/` updated by
the deploy script (a one-line addition: `cp -al app/ prev/` before
the rsync). Then a rollback is `rm -rf app && mv prev app && systemctl restart teww`.

## Monitoring

The health endpoint at `/api/health` returns 200 with `{ ok, uptime, db_ms }`.
Wire it into UptimeRobot (free), Better Uptime, or simply a daily curl
+ mail-on-failure systemd timer if you'd rather stay self-contained.

## Operating cost

| Line item | Cost / mo |
|---|---|
| VPS (Hostinger, 6 vCPU / 12 GB) | $6.72 |
| Backblaze B2 (~10 GB) | <$0.10 |
| Domain (one-off ~$12/yr) | ~$1 |
| Resend (≤3k mails/mo) | $0 |
| **Total** | **~$8/mo** |

vs the Vercel-Pro + managed-Postgres stack at $30+/mo for the same
traffic profile.
