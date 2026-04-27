# Dokploy + VPS deploy runbook

Self-hosted on a single Debian 12 VPS, with [Dokploy](https://dokploy.com)
managing the container lifecycle. Dokploy gives you the operational
ergonomics of Vercel (git-push deploy, env-var UI, auto-TLS,
rollback button, log panel) on infrastructure you control.

## What this branch ships

| Path | Purpose |
|---|---|
| `Dockerfile` | Multi-stage Node 20 Alpine build; emits a slim runtime image with the Next.js standalone server, Prisma, and a `/data` volume mount. |
| `scripts/docker-entrypoint.sh` | Runs `prisma migrate deploy` → conditional seed → `node server.js`. |
| `.dockerignore` | Keeps the build context lean. |
| `app/api/health/route.ts` | Health endpoint Dokploy / the Docker `HEALTHCHECK` poll. |
| `vercel.json` *(removed)* | Cron config moves into Dokploy's UI. |
| `deploy/dokploy-vps/RUNBOOK.md` | This file. |

## Architecture

```
                 Internet (443)
                       │
                       ▼
              ┌─────────────────────┐
              │      Traefik        │  managed BY Dokploy
              │  (auto Let's        │  TLS + reverse proxy
              │   Encrypt certs)    │
              └─────────┬───────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │  teww container     │  ← Node 20 Alpine
              │  (Docker / Swarm)   │     standalone Next.js
              └────────┬────────────┘
                       │  volume mount: /data
              ┌────────┴────────────┐
              ▼                     ▼
       /data/prod.db         /data/uploads/
       (SQLite WAL,          (media adapter
        host volume)          writes here via
                              symlink)
```

The container runs as UID 1001 (`nextjs`). The host volume mounted at
`/data` must be writable by 1001 — Dokploy handles that automatically
when you create a "named volume" through the UI.

## VPS provisioning

Tested on Debian 12. Dokploy's installer expects a fresh box.

### 1. Base setup (~10 min)

Same as the [vps-only runbook](../vps-only/RUNBOOK.md#1-base-hardening-10-min) —
non-root user, SSH-key auth, ufw with `OpenSSH` + `80/tcp` + `443/tcp` allowed.

> **Don't open Docker's default port 2375 / 2376** to the world.
> Dokploy talks to the local Docker socket; the only publicly-exposed
> ports should be 80 / 443.

### 2. Install Dokploy (one command)

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

This installs Docker, initialises Docker Swarm (single-node),
provisions Traefik, and starts the Dokploy server itself.
~5 min depending on network.

When it finishes the installer prints the URL and admin token —
something like `http://<vps-ip>:3000`. Save the token; first login
uses it.

### 3. Point DNS at the VPS

```
A     your-domain.com           <vps-ip>
A     www.your-domain.com       <vps-ip>
A     dokploy.your-domain.com   <vps-ip>     # optional, for the admin UI
```

Wait for DNS propagation (~5 min for major providers). Verify with
`dig www.your-domain.com +short`.

### 4. Sign in to Dokploy

`http://<vps-ip>:3000` → enter the install token → create the admin
account. **Then optionally set up TLS for the Dokploy UI itself:**
Settings → SSL/TLS → enable for `dokploy.your-domain.com`. Now the
admin UI is at `https://dokploy.your-domain.com` and you can close
the public 3000 port (`ufw delete allow 3000/tcp`).

## Project setup in Dokploy

### 1. New project → "TEWW"

Projects group related apps. One project per environment is the
common pattern; we'll use one.

### 2. Add an Application → Source: GitHub

- **Repository:** `Taha-Mahmoodi/third-eye-worldwide`
- **Branch:** `main` (or `deploy/dokploy-vps` while testing)
- **Build type:** Dockerfile (Dokploy auto-detects from the repo).
- **Dockerfile path:** `./Dockerfile`
- **Build context:** `.` (repo root)

Dokploy clones over HTTPS by default; for private repos add a deploy
key under Settings → Git Providers.

### 3. Domains

Add both:

| Domain | HTTPS | Path | Strip path |
|---|---|---|---|
| `www.your-domain.com` | ✓ | `/` | – |
| `your-domain.com` | ✓ | `/` | – |

Tick "Force HTTPS" on each. Traefik auto-fetches Let's Encrypt
certs the first time the domain resolves.

> If you want a canonical-www redirect, set the apex domain to
> redirect → `https://www.your-domain.com` instead of routing to
> the container directly. Dokploy supports this in the domain settings.

### 4. Environment variables

Paste under Environment → Production:

```dotenv
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Database (host-volume backed)
DATABASE_URL=file:/data/prod.db

# Auth
AUTH_SECRET=                                  # openssl rand -base64 32
NEXTAUTH_URL=https://www.your-domain.com
NEXT_PUBLIC_SITE_URL=https://www.your-domain.com

# CMS write token (legacy x-cms-token API path).
# Store the SHA-256 hex of the secret you actually pass in headers.
CMS_TOKEN=

# Initial admin (only used by prisma/seed.mjs on first run)
CMS_ADMIN_EMAIL=you@your-domain.com
CMS_ADMIN_PASSWORD=

# Email
RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=hello@your-domain.com

# Cron (PII purge)
CRON_SECRET=                                  # openssl rand -base64 32
```

### 5. Volumes

Add a **named volume** mounted at `/data`. Dokploy persists it across
rebuilds + restarts.

| Type | Name | Mount path |
|---|---|---|
| Volume | `teww-data` | `/data` |

The Dockerfile already creates `/data/uploads` and symlinks
`public/uploads → /data/uploads`, so on first start Dokploy
mounts the empty volume, the entrypoint runs migrations against
`file:/data/prod.db`, and uploads land on the volume from then on.

### 6. Build args / advanced settings

- **Healthcheck:** the Dockerfile already declares one (`/api/health`
  via `node -e fetch(…)`); Dokploy will respect it without further
  configuration.
- **Restart policy:** "always" (default).
- **Replicas:** 1. SQLite is single-writer; running two replicas
  would race on the DB file. If you ever migrate to Postgres on
  the same VPS, you can scale up.

### 7. Deploy

Hit **Deploy**. Dokploy will:

1. `git clone` your repo at the configured branch.
2. `docker build` against the Dockerfile.
3. Run the Docker Swarm rolling-update (replaces the previous
   container only after the new one passes the healthcheck).
4. Reconfigure Traefik to route the configured domains at the
   new container.

First build is slow (~3-5 min) because the Alpine + node-modules
layers are uncached. Subsequent builds are sub-30s for code-only
changes.

When the deploy turns green, hit `https://www.your-domain.com` and
sign in at `https://www.your-domain.com/admin/login` with the
admin email + password from the env vars.

### 8. Cron job for PII purge

In Dokploy → Project → Cron Jobs:

| Field | Value |
|---|---|
| Name | `monthly-pii-purge` |
| Schedule | `0 3 1 * *` |
| Container | `teww` |
| Command | `wget -q -O /dev/null --header="Authorization: Bearer ${CRON_SECRET}" http://localhost:3000/api/cron/purge-pii` |

(Replaces the original `vercel.json` `crons` entry. The wget runs
inside the container so it sees the local `:3000`.)

Alternative: Dokploy's Scheduler feature runs an HTTP request directly
without a container — same outcome, slightly cleaner UI.

### 9. Backups

Dokploy → Project → Backups (uses restic under the hood):

| Field | Value |
|---|---|
| Schedule | `0 2 * * *` (nightly 02:00) |
| Volume | `teww-data` |
| Destination | S3 / B2 / SFTP — pick one |
| Retention | `--keep-daily 7 --keep-weekly 4 --keep-monthly 12` |

The `teww-data` volume contains both `prod.db` and `uploads/`, so
one backup target captures everything stateful.

> **Restore drill:** spin up a second app from this branch with the
> same volume snapshot mounted; verify the site comes up + sign-in
> works. Do this once at provisioning time and write down the
> recovery RTO so future-you knows what to expect.

## Continuous deployment

Dokploy auto-deploy:

- **Webhook:** Dokploy → Application → Settings → Auto Deploy → toggle.
  Dokploy registers a webhook on your GitHub repo. Pushes to `main`
  trigger a rebuild + roll.
- **Rollback:** Application → Deployments → click any prior deploy →
  Re-deploy. The previous Docker image is reused, so rollback is
  ~10s.

## Operational checks

| Concern | How |
|---|---|
| Logs | Application → Logs panel. Live tail. |
| CPU / RAM | Application → Monitoring (Dokploy ships its own metrics). |
| TLS expiry | Traefik renews automatically; UI shows days remaining. |
| Disk pressure | `docker system prune -a --volumes` periodically; Dokploy has a setting for image retention. |
| OS updates | `unattended-upgrades` (set during base hardening). |
| Dokploy itself | `dokploy update` — pin major versions until you've tested. |

## Operating cost

| Line item | Cost / mo |
|---|---|
| VPS (Hostinger 6 vCPU / 12 GB) | $6.72 |
| Backblaze B2 (~10 GB) | <$0.10 |
| Domain | ~$1 |
| Resend (≤3k mails/mo) | $0 |
| **Total** | **~$8/mo** |

Same as the bare-metal vps-only setup. Dokploy itself is free + open
source; the only cost is one-off install time.

## When to choose this branch over `vps-only`

| You want… | Pick |
|---|---|
| Git-push deploys without writing CI | **dokploy-vps** |
| Web UI for env vars, logs, rollback | **dokploy-vps** |
| Multiple apps / environments on one VPS | **dokploy-vps** |
| Simplest possible setup, edit Caddyfile by hand | **vps-only** |
| Lowest baseline RAM (every MB matters) | **vps-only** (~150 MB vs ~700 MB) |
| Tiniest attack surface (no Docker, no orchestrator) | **vps-only** |
