# Deployment

Third Eye Worldwide ships in two parallel configurations. Pick whichever
fits your hosting situation; neither is more "supported" than the other.

---

## Option 1 — Docker (self-hosted)

Best for: a single VPS, air-gapped deploys, NGO infra where you want the
whole stack in one volume you can back up.

### Prerequisites
- Docker Engine 24+ and Docker Compose plugin.
- A copy of `.env` derived from `.env.example`.

### Quick start
```bash
cp .env.example .env                       # fill in real values
openssl rand -base64 32                    # paste into NEXTAUTH_SECRET
docker compose up -d --build               # build + start
docker compose logs -f app                 # watch the boot log
```

First boot:
- Entrypoint runs `prisma migrate deploy` (applies any pending migrations).
- Runs the seed **only if SiteContent is empty**, so restarts never clobber
  edits made through the CMS.
- Starts the standalone Next server on `:3000`.

Subsequent boots skip the seed; migrations still apply if new ones exist.

### What you end up with
- **App container** `teww-app` (Alpine, ~170 MB).
- **Named volume** `teww-data` holding the SQLite DB (`/data/teww.db`).
  All CMS edits, publish history, and form submissions persist here.
- **Healthcheck** on `/api/auth/csrf` every 30 s.

### Backups
Dump the volume:
```bash
docker run --rm -v teww-data:/data -v "$PWD":/backup alpine \
  tar czf /backup/teww-$(date +%Y%m%d).tgz -C /data .
```
Restore by reversing the tar.

### Upgrading to Postgres
The default is SQLite because most deploys don't need more. When they do:
1. Edit `prisma/schema.prisma` → `provider = "postgresql"`.
2. Set `DATABASE_URL` to the Postgres connection string (Neon, Supabase, RDS, …).
3. Rebuild: `docker compose up -d --build`.
4. The first boot runs `prisma migrate deploy` against Postgres and re-seeds.

Do this BEFORE you've accumulated CMS edits you care about, or migrate data
out of SQLite first (`sqlite3 teww.db .dump | psql ...`).

### Behind a reverse proxy
Set `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` in `.env` to the public
HTTPS URL (e.g. `https://www.thirdeyeworldwide.org`). Terminate TLS at
your proxy (Caddy, nginx, Traefik, Cloudflare Tunnel) and pass-through to
`localhost:3000`.

---

## Option 2 — Non-Docker (PaaS or bare Node)

Best for: Vercel, Netlify, Render, Fly, or any Node runtime that already
handles the build.

### Vercel (zero-config)
1. Push the repo to GitHub.
2. "New Project" in Vercel, import the repo.
3. Add env vars from `.env.example` in the Vercel project settings
   (at minimum: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`,
   `CMS_ADMIN_EMAIL`, `CMS_ADMIN_PASSWORD`, `DATABASE_URL`).
4. Vercel auto-detects Next.js. `vercel.json` already sets the cache +
   security headers.
5. For Prisma on Vercel, prefer a hosted Postgres (Neon / Vercel Postgres)
   and change `prisma/schema.prisma` to `postgresql`.

### Netlify
1. Push to GitHub; import in Netlify.
2. `netlify.toml` pulls in `@netlify/plugin-nextjs` automatically.
3. Set env vars in Site settings → Environment variables.
4. Same Prisma caveat: use a hosted Postgres, not the SQLite file.

### Any Node host (Fly, Render, EC2, …)
```bash
npm ci
npm run build                  # emits .next/standalone
NODE_ENV=production node .next/standalone/server.js
```
- Make sure `DATABASE_URL` points somewhere writable (SQLite file or Postgres).
- Run `npx prisma migrate deploy` once per release.
- Run `npm run db:seed` once on first deploy.

### SystemD template
Example unit for a plain-Node deploy:
```ini
[Unit]
Description=Third Eye Worldwide
After=network.target

[Service]
Type=simple
User=teww
WorkingDirectory=/opt/teww
EnvironmentFile=/opt/teww/.env
ExecStart=/usr/bin/node .next/standalone/server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## Common pre-flight checklist

- [ ] `.env` set up (copy from `.env.example`, fill in real values).
- [ ] `NEXTAUTH_SECRET` generated fresh (`openssl rand -base64 32`).
      The app refuses to start in production without it.
- [ ] `NEXT_PUBLIC_SITE_URL` matches your public origin — affects canonical
      URLs, OpenGraph card absolute URLs, and the sitemap entries.
- [ ] `CMS_ADMIN_EMAIL` / `CMS_ADMIN_PASSWORD` are what you want for
      the first admin login. Rotate the password in the admin UI after
      first login.
- [ ] DB reachable: for SQLite the container volume handles it; for
      Postgres run `npx prisma migrate deploy` against the real DB once.
- [ ] Rate-limiting in `lib/rate-limit.js` is in-memory. For a
      multi-instance deploy, swap for Upstash Redis / Cloudflare KV.
