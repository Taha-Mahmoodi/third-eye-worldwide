# Senior-dev audit — Third Eye Worldwide

This is a living document capturing review findings and how each one is
resolved. Audit scope: the entire `third-eye-worldwide` repo as of the
Option B refactor (post-PR #24).

Each finding carries a **severity**, a **status**, and — once closed — a
**resolution** linking the PR that fixed it.

Severity scale
- **P0** — security / data-integrity / correctness. Fix before shipping.
- **P1** — SEO / performance / maintainability. Block a production launch.
- **P2** — polish / follow-ups. Ship later, schedule within the quarter.

---

## Security & correctness

### S1 (P0) — `NEXTAUTH_SECRET` has a fallback
**Status:** ✅ resolved — this PR.

`lib/auth.js:57` and `middleware.js:19` both fall back to the literal
string `'dev-secret-change-me'`. In production this allows anyone who
knows that fallback (everyone, it's in the public repo) to forge a
valid JWT and access `/admin`.

**Fix:** in production (`NODE_ENV === 'production'`) the env var is
required. Process exits with a clear error during init if missing.
Dev still has a fallback so local work is friction-free.

### S2 (P0) — Public submission endpoints have no rate limiting
**Status:** ✅ resolved — this PR.

`POST /api/cms/submissions/volunteer` and `/api/cms/submissions/donation`
are unauthenticated. A trivial script can flood the DB.

**Fix:** added `lib/rate-limit.js` (per-IP, in-memory token bucket,
20 req / 15 min per IP on submission endpoints). Returns 429 with
`Retry-After`. Good enough for single-instance deploys; multi-instance
would need Redis — a TODO is noted in the file.

### S3 (P0) — Donation `amount` has no upper bound
**Status:** ✅ resolved — this PR.

The endpoint clamps to `Math.max(0, …)` but an attacker could submit
`amount: 1e18`. The DB stores it. A typo from a real donor could also
create confusing records.

**Fix:** reject amounts outside `[1, 1_000_000]` with a 400. The donor
sees "Amount looks wrong — please check and try again."

### S4 (P0) — No body-size guard on `PUT /api/cms/data`
**Status:** ✅ resolved — this PR.

Admins can push the entire CMS document. Without a size limit, a
malformed client or a compromised session could send a 100MB payload
and stall the server.

**Fix:** reject requests with `Content-Length > 2 MB`.

### S5 (P1) — No `.env.example`
**Status:** ✅ resolved — this PR.

New contributors have to read the source to figure out which env vars
are needed.

**Fix:** added `.env.example` with the full var list + inline notes
for each.

### S6 (P1) — Email format not validated on submissions
**Status:** ✅ resolved — this PR.

Routes accept anything that's a non-empty string. Downstream admin UI
then sends junk mail attempts.

**Fix:** rejected with a 400 if the email fails a standard format check.

### S7 (P2) — `CMS_TOKEN` header auth still accepted alongside session auth
**Status:** open.

`lib/cms/auth-guard.js:10` lets a static env-var token bypass the
session check. Intended for scripted clients. But it means rotating the
token means a deploy, and no revocation trail.

Follow-up: mint rotatable API keys per admin; keep the legacy
`x-cms-token` until external scripts migrate.

---

## SEO & performance

### P1 (P1) — No per-route metadata / OpenGraph / Twitter cards
**Status:** open — next PR will address.

Only `app/layout.js` has `metadata`. Individual routes (`/projects`,
`/about`, `/documents`, etc.) have only `title`. No `description`,
`openGraph`, `twitter`, or canonical URL.

### P2 (P1) — No `sitemap.xml`, no useful `robots.txt`
**Status:** open — next PR.

`public/robots.txt` is stock. Crawlers get no sitemap reference.

### P3 (P1) — No JSON-LD structured data
**Status:** open — next PR.

An NGO-class site should publish at minimum `Organization` + per-page
`WebPage` JSON-LD. Plus `BreadcrumbList` on detail pages.

### P4 (P1) — Every route is `export const dynamic = 'force-dynamic'`
**Status:** open — scheduled after SEO PR.

`force-dynamic` means every request hits Prisma. Site content changes
at most on publish. Should be `export const revalidate = 60` with
`revalidatePath` on publish (already wired in the PUT route — just not
used because of `force-dynamic`).

### P5 (P1) — Phosphor icons loaded as 3 CSS bundles from unpkg CDN
**Status:** open — performance PR later.

Every page loads the full Phosphor Regular + Fill + Bold CSS from
unpkg.com. That's a significant byte tax + a third-party dependency
per-render.

Options: migrate to `@phosphor-icons/react` and import only the icons
used, or self-host only the icons the site references.

### P6 (P1) — No `<Image>` usage; raw `<img>` tags throughout
**Status:** open.

No srcset, no lazy loading opt-in (Next `<Image>` gives it for free),
no layout-shift protection. Hero + team + story images would benefit.

---

## Maintainability

### M1 (P1) — `ClientBootstrap` exposes stale `window.*` helpers
**Status:** ✅ resolved — this PR.

Post-refactor, `window.setDonateMode`, `pickAmount`, `filterPills`, and
`activateSub` are no longer called by any first-party code (grepped
the tree; zero call sites outside `ClientBootstrap.js` itself). They
are removed in this PR. `goto` / `setTheme` / `setSize` / `cycleTheme`
/ `toggleNav` / `closeNav` kept — legacy string renderers (`blog-detail`,
`story-detail`, `custom`) still rely on them.

### M2 (P2) — `HtmlContent` still used by blog-detail / story-detail / custom
**Status:** open — finish the Option B refactor.

Two routes remain on the legacy HTML-string renderer. Once migrated,
`components/HtmlContent.js` can be deleted. The string-renderer pattern
also blocks CSP from going stricter (inline `<script>` re-execution).

### M3 (P1) — `README.md` is outdated post-refactor
**Status:** open.

Mentions "programs route" (renamed to `projects` in PR #12), "HtmlContent
injection" (removed for 8 routes in PRs #18-24), and the legacy file
layout under `lib/pages/` (half the files are gone).

### M4 (P2) — No lint / format / test scripts
**Status:** open.

`package.json` has no `lint` entry, no Prettier config, no test
framework. A single ESLint config + a pre-commit hook would catch a lot
before CI.

### M5 (P2) — Console.log / console.warn in production code paths
**Status:** open.

Several files (`lib/cms/db.js`, `public/admin/dashboard.js`, error
boundaries) log to console unconditionally. No structured logger,
no environment-aware silencing. Fine for dev; noisy in prod.

---

## Accessibility (a11y)

### A1 (P1) — Hero images have no `alt` text in several places
**Status:** open.

The `<img>` tags that render team photos and hero imagery fall back to
empty alt when the CMS field is blank. For the team page specifically
(PR #15 added self-hosted portraits) alt is set — but mission photos,
story hero backgrounds, etc. don't have reliable alt text. Should default
to decorative (`alt=""`) and opt-in to descriptive alt from the CMS.

### A2 (P2) — Focus states rely on browser default ring
**Status:** open.

Keyboard-only users get the browser's default focus ring, which the
design overrides in a couple of places with `outline: none`. Need a
consistent brand focus ring across all interactive elements.

---

## Deployment & DX

### D1 (P1) — No containerised deploy story
**Status:** ✅ resolved — PR #28.

Adds a multi-stage `Dockerfile` producing a ~170 MB Alpine runtime, a
`docker-compose.yml` with a named volume for the SQLite file, and
`scripts/docker-entrypoint.sh` that migrates + seeds idempotently on
first boot. `DEPLOYMENT.md` documents both docker and non-docker paths
(Vercel / Netlify / bare Node / SystemD template). `next.config.mjs`
enables `output: 'standalone'` — harmless for PaaS deploys, essential
for the slim container.

### D2 (P2) — No CI
**Status:** open.

No GitHub Actions. Every PR relies on the platform's preview build
(Vercel) to catch regressions. At minimum we should run
`next build` + `prisma generate` in CI.

---

## Appendix — resolved items in this PR

- S1 Secret hardening
- S2 Rate limiting on submissions
- S3 Donation amount cap
- S4 CMS PUT body-size guard
- S5 `.env.example`
- S6 Email format validation on submissions
- M1 Dead `window.*` helper cleanup

Everything else is scheduled into subsequent PRs; see "Status" lines.
