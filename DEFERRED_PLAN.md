# Deferred Review Items — Implementation Plan

**Targets:** MED-5, MED-8, MED-9 from `CODEBASE_REVIEW.md`
**Status as of 2026-04-27:** all three deferred during the April 2026 review-implementation pass; this doc is the plan to pick them up.

This is a runbook, not a sketch. Each section names the exact files to change, the open decisions a human needs to make first, the verification steps, and the rollback story. Read top to bottom before starting any of the three — they're sequenced deliberately.

---

## TL;DR — recommended order

1. **MED-9** first (Auth.js v5). Smallest diff, highest blast radius. Doing it now means MED-8's email-confirmation route handler is written against the modern auth surface from day one instead of being rewritten during the v5 cutover.
2. **MED-8** second (email confirmation). Builds on MED-9's auth context. Independent of MED-5.
3. **MED-5** last (Phosphor CDN → React). Mostly mechanical. No coupling to the other two. Defer until you have a quiet week to chase visual regressions.

If these are picked up out of order, none of them break — but #1 → #2 saves rework on the confirmation routes.

---

# MED-9 — Migrate NextAuth v4 → Auth.js v5 (`next-auth@beta`)

## Goal
Move off `next-auth@4` (previous major version, in security-patch-only mode) onto Auth.js v5. Single PR, no behavior change visible to end users.

## Why this is small but scary
- The diff is maybe 80 lines across four files.
- But every authenticated request on the site flows through this code — admin login, the CMS dashboard, all the admin DELETE endpoints we shipped in CRIT-2, and `getServerSession` lookups in API routes.
- A bad cutover means the dashboard is locked out and content can't be published.

## Pre-flight decisions (need a human)

1. **Maintenance window.** Schedule for off-hours. Plan ~30 minutes of admin downtime. Communicate the window with anyone who edits the CMS.
2. **Backup the DB before deploy.** `prisma/dev.db` for SQLite, or `pg_dump` for Postgres. v5 migration shouldn't touch tables, but if anything corrupts the user table you want a rollback artifact.
3. **Adapter or no adapter?** Current setup is pure JWT-strategy credentials with no Prisma adapter. Recommend keeping it that way — adapters add complexity v5 already smoothed over.
4. **`AUTH_SECRET` rename.** v5 prefers `AUTH_SECRET` over `NEXTAUTH_SECRET` (still backward-compatible). Decide whether to rename now (cleaner, requires env update on Vercel + local) or leave on the legacy name (zero env churn).

## Files that change

| File | Change |
|---|---|
| `package.json` | `next-auth: "^4.x"` → `"next-auth": "^5.0.0"` (or `@beta` until stable) |
| `lib/auth.ts` | Drop `NextAuthOptions`, export `auth`, `signIn`, `signOut`, `handlers` from `NextAuth(...)` directly. Keep the credentials provider, password verify, JWT/session callbacks. |
| `app/api/auth/[...nextauth]/route.ts` | Replace the v4 handler factory with `export const { GET, POST } = handlers;` |
| `middleware.ts` | Replace `getToken()` with the new `auth()` middleware wrapper. Same allow/deny logic. |
| `app/api/cms/data/route.ts` | `getServerSession(authOptions)` → `auth()` (server side) |
| `lib/cms/auth-guard.ts` | Same — swap `getServerSession` for `auth()`. |
| `app/admin/login/LoginForm.tsx` | If it uses `signIn` from `next-auth/react`, the import path stays the same — verify after upgrade. |
| `app/admin/page.tsx` and any other server component reading the session | swap `getServerSession` for `auth()`. |
| `.env.example` | If renaming, update the `NEXTAUTH_SECRET` block to `AUTH_SECRET`. |

## Step-by-step

```bash
# 0. Branch off main
git checkout -b feat/auth-js-v5-migration origin/main

# 1. Install
npm install next-auth@beta

# 2. Edit lib/auth.ts — see template below
# 3. Edit app/api/auth/[...nextauth]/route.ts — see template below
# 4. Edit middleware.ts — see template below
# 5. Edit lib/cms/auth-guard.ts and any getServerSession callers

# 6. Verify
npm run typecheck
npm run test:run         # all 42 existing tests must still pass
npm run build            # must complete without errors

# 7. Smoke test locally
npm run dev
# - Open /admin/login, sign in with seed admin
# - Open /admin (dashboard) — should see content editor
# - Try POST /api/cms/data via the dashboard publish button
# - Try DELETE /api/cms/submissions/volunteer/<some-id>
# - Try with a bad password — should still 401 + log auth_failed
# - Try logging in 6 times with bad password from same IP — 6th should rate-limit (MED-3 still works)

# 8. Ship as one PR. No squash-merge until smoke test passes on Vercel preview.
```

## Code templates

`lib/auth.ts` (the new shape):
```ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { prisma } from '@/lib/cms/db';
import {
  SESSION_MAX_AGE_SECONDS,
  LOGIN_RATE_LIMIT_MAX_REQUESTS,
  LOGIN_RATE_LIMIT_WINDOW_MS,
} from '@/lib/constants';
import { checkAsync } from '@/lib/rate-limit';
import logger from '@/lib/logger';

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  // ... unchanged
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: SESSION_MAX_AGE_SECONDS },
  pages: { signIn: '/admin/login' },
  providers: [
    Credentials({
      // same authorize body as today, including the rate limiter +
      // logger calls already added in MED-3. The signature is now
      // (credentials) => ... and `req` comes from a separate context.
    }),
  ],
  callbacks: {
    // same jwt + session callbacks
  },
  // No `secret:` field — v5 reads AUTH_SECRET (or NEXTAUTH_SECRET) automatically.
});
```

`app/api/auth/[...nextauth]/route.ts`:
```ts
export { GET, POST } from '@/lib/auth';
// (or `export const { GET, POST } = handlers;` after importing handlers)
```

`middleware.ts`:
```ts
import { auth } from '@/lib/auth';

export default auth((req) => {
  // existing pathname-allowlist logic — ported verbatim
});

export const config = {
  matcher: [/* same matcher as today */],
};
```

## Verification checklist
- [ ] `npm run typecheck` clean
- [ ] All 42 tests still pass (`tests/unit/auth.test.ts` exercises `verifyPassword` directly — tightest signal)
- [ ] `npm run build` clean
- [ ] On a Vercel preview: login, dashboard load, publish, DELETE submission, logout all work
- [ ] No console errors mentioning `getServerSession` or `getToken` deprecation
- [ ] `auth_success` and `auth_failed` log events still emit through `lib/logger.ts`

## Rollback
- Revert the PR. Run `npm install` to restore v4. Redeploy.
- No DB schema changes, no data loss risk.

## Estimated effort
~3–4 hours including testing. Best done in one focused session, not split across days.

---

# MED-8 — Email confirmation for form submissions

## Goal
Add a double-opt-in step to volunteer + donation submissions. After a user submits, they get an email with a signed link; clicking it flips `confirmed: true` on the row. The admin inbox filters to confirmed submissions by default. Stops anyone from submitting forms with someone else's email.

## Why this is the largest of the three
- Schema change (Prisma migration).
- New external dependency (an email provider).
- Two new code paths to reason about: send-on-submit, confirm-on-click.
- Token signing + verification needs to be timing-safe and replay-resistant.

## Pre-flight decisions (need a human)

1. **Email provider.** Three reasonable choices:
   - **Resend** (recommended) — one of the simplest APIs, free tier 3000 emails/month, strong deliverability, React Email templates supported. ~10 minutes to provision.
   - **Nodemailer + any SMTP** (Postmark, SendGrid, Amazon SES, Mailgun, even Gmail SMTP). More flexible, more env config.
   - **Self-hosted (Postfix etc).** Don't.
   - Decision impacts ~30 lines of code in `lib/email/send.ts`. Everything else is provider-agnostic.

2. **Confirmation token TTL.** 24 hours is a reasonable default. Anything older the user has to re-submit the form.

3. **Donation form: confirm or skip?** The donation form is intent-only (Option B copy already shipped). Some teams skip confirmation on the intent path because the team contacts the donor manually anyway. Recommend: **still require confirmation** — it gates the email from spam. Skipping confirmation lets bots flood the admin inbox.

4. **Re-send flow.** Should the user be able to request a new confirmation email if the first is lost? Recommend: yes, but rate-limited (1 per IP per hour).

5. **Email content / template.** Plain text + minimal HTML template. The team should write the actual copy. Suggested skeleton in the template section below.

6. **i18n.** Site is English-first today. Email is English-only for v1. Add localisation later if/when the site does.

7. **Sender identity.** `noreply@thirdeyeworldwide.org` (recommended) or a real human address? Need DNS records (SPF/DKIM/DMARC) configured at the provider before sending.

## Files that change / are added

| File | Change |
|---|---|
| `prisma/schema.prisma` | Add `confirmed Boolean @default(false)` to `VolunteerSubmission` and `DonationSubmission` |
| `prisma/migrations/<timestamp>_add_confirmed/` | Generated by `prisma migrate dev --name add_confirmed` |
| `lib/email/send.ts` | New — provider-agnostic `sendEmail({ to, subject, text, html })` wrapper. Implementation is Resend or Nodemailer per decision #1. |
| `lib/email/templates/confirm-volunteer.ts` | New — generates `{ subject, text, html }` for the volunteer confirmation email |
| `lib/email/templates/confirm-donation.ts` | New — same shape, donation copy |
| `lib/email/token.ts` | New — sign/verify HMAC-SHA256 tokens with timing-safe compare |
| `app/api/cms/submissions/volunteer/route.ts` | After `prisma.volunteerSubmission.create`, send the confirmation email. Don't fail the submit if email send fails (log + continue). |
| `app/api/cms/submissions/donation/route.ts` | Same pattern |
| `app/api/cms/submissions/confirm/route.ts` | New GET handler. Reads `?type=&id=&token=`, validates token, sets `confirmed=true`, redirects to `/?confirmed=1` (or a friendly confirmation page) |
| `app/api/cms/submissions/volunteer/route.ts` (GET) | Filter `where: { confirmed: true }` by default; allow `?all=true` to include unconfirmed (admin-only) |
| `app/api/cms/submissions/donation/route.ts` (GET) | Same |
| `app/api/cms/submissions/resend-confirmation/route.ts` | New POST endpoint, rate-limited (1 per IP per hour). Looks up the row by id+email, regenerates token, re-sends. |
| `tests/api/confirm-token.test.ts` | New — sign + verify happy path, expired token, tampered token, unknown id |
| `.env.example` | New `RESEND_API_KEY` (or SMTP_* vars) plus `EMAIL_FROM_ADDRESS` |
| `lib/constants.ts` | `CONFIRMATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000` |

## Token format

HMAC-SHA256 over a deterministic string:
```ts
const message = `${type}.${id}.${createdAtIso}`;
const signature = hmac('sha256', AUTH_SECRET, message).digest('hex');
const token = base64url(`${createdAtIso}:${signature}`);
```

Verification:
1. base64url-decode the token, split on `:`
2. Look up the row by `id + type`. If not found → 404.
3. Reject if `createdAtIso` doesn't match the row's actual `createdAt`. (Stops attacker from forging a token for an arbitrary id.)
4. Recompute signature with `AUTH_SECRET` and compare with `timingSafeEqual`.
5. Reject if `Date.now() - createdAt > CONFIRMATION_TOKEN_TTL_MS`.
6. Set `confirmed=true`, redirect.

This is replay-safe (token is bound to a specific submission) and tamper-safe (signature must match) and TTL-bound.

## Email template skeleton (volunteer)

```
Subject: Confirm your Third Eye Worldwide volunteer application

Hi {{name}},

Thanks for applying to volunteer with Third Eye Worldwide. Click the
link below within 24 hours to confirm your application:

  {{siteUrl}}/api/cms/submissions/confirm?type=volunteer&id={{id}}&token={{token}}

If you didn't fill out our volunteer form, you can ignore this email —
your address won't be added to anything.

— The Third Eye Worldwide team
```

(Same shape for donation; substitute the wording.)

## Step-by-step

```bash
git checkout -b feat/email-confirmation origin/main

# 1. Install email provider client. If Resend:
npm install resend
# If Nodemailer:
# npm install nodemailer && npm install -D @types/nodemailer

# 2. Schema change
# Edit prisma/schema.prisma — add `confirmed Boolean @default(false)` to both submission models.
npx prisma migrate dev --name add_confirmed

# 3. Build out lib/email/* and the route handlers per the table above.

# 4. Update tests:
#    - tests/api/volunteer-submission.test.ts: mock the email send function
#    - tests/api/donation-submission.test.ts (new): same shape as volunteer
#    - tests/api/confirm-token.test.ts (new): verify signing helper

# 5. Verify
npm run typecheck
npm run test:run
npm run build

# 6. Smoke test (requires real provider creds)
# - Submit volunteer form → email arrives
# - Click link → row's `confirmed` flips to true
# - Click link again → 200 (idempotent) or noop
# - Tamper with token → 400
# - Wait 25h, click link → 410 Gone (or similar)
# - Without `?all=true` admin GET only returns confirmed rows
# - With `?all=true` admin GET returns everything (admin auth required)

# 7. Ship one PR. Do NOT include the `?all=true` flip-the-default change in a separate PR — it's a single coherent feature.
```

## Verification checklist
- [ ] `prisma migrate dev` produces a clean migration; nothing else changes
- [ ] Existing volunteer submission test still passes (after mock update)
- [ ] New `confirm-token.test.ts` covers: happy path, expired, tampered, unknown id, replay (clicked twice)
- [ ] Build clean
- [ ] On a real preview deploy with real provider creds: end-to-end submit → email → confirm flow works

## Rollback
- Revert the PR.
- Roll back the migration: `prisma migrate resolve --rolled-back <migration-name>` then drop the column manually if needed.
- Submissions stop sending confirmation emails. Existing rows are unaffected (the column is gone).

## Estimated effort
- 1–2 days. The provider account setup + DNS records are usually the slowest part, not the code.

## Risks I want to flag
- **Email deliverability.** A new sender domain often lands in Promotions or spam initially. SPF/DKIM/DMARC records must be set up before going live, or confirmations will silently fail and the admin inbox will fill up with unconfirmed rows that look like spam.
- **Email send failure.** If Resend has an outage and we fail-closed, all submissions reject. Recommend fail-open: log `email_send_failed` and accept the submission anyway — admin sees an "unconfirmed" row. The user can re-request the email.
- **Token leakage in logs.** The full URL contains the token. Make sure `confirm` route doesn't log the URL — only the result (`confirmation_succeeded`, id).

---

# MED-5 — Phosphor CDN → `@phosphor-icons/react`

## Goal
Replace the three `<link>` tags in `app/layout.tsx` that load Phosphor icon CSS from `unpkg.com` with named React components imported from `@phosphor-icons/react`. Tighten the CSP to drop `unpkg.com`.

## Why this is the most tedious of the three
There's nothing intellectually hard. There are just **a lot** of icons:

- **54 hardcoded** `<i className="ph ph-X" />` instances across 29 files
- **20 unique CMS-driven icons** stored as strings in `data/seed.json`, rendered dynamically by 6 components

The CMS-driven path is the gotcha. Today an admin can type any icon name into the CMS data and it renders. After migration, the React-component path needs an explicit allowlist — you can't dynamically import a React component from a runtime string without killing tree-shaking.

## Pre-flight decisions (need a human)

1. **Bundle vs flexibility tradeoff.**
   - Option A: Allowlist the 20 known CMS icons. Tree-shaking works. Adding a 21st icon means a developer ships a code change.
   - Option B: Dynamic-import every icon by name. Tree-shaking dies. Bundle grows by hundreds of KB.
   - Option C: Keep the CDN font ONLY for the 6 dynamic-rendering components, migrate the 54 hardcoded ones. Smallest bundle reduction, simplest migration.
   - **Recommended: Option A.** Document the allowlist in a `CmsIcon.tsx` component. Adding new icons is a one-line PR.

2. **Visual QA budget.** Sizing, weight, and alignment will shift in subtle ways across ~40 distinct icon callsites. Need someone to walk every page (light + dark + high-contrast) and screenshot-compare or eyeball.

3. **Animated icons.** The pulsing heart on Donate (`HeartPulseIcon`) and the per-tab nav icons (`NavTabIcon`) are already inlined SVG via `motion/react` — they're already not on the CDN. Don't touch them.

## Inventory (do not skip this)

### 54 hardcoded icons in 29 files

Run this to regenerate the list any time:
```bash
grep -rhoE 'className="[^"]*ph[ -]ph-[a-z0-9-]+[^"]*"' --include='*.tsx' . \
  | grep -oE 'ph-[a-z][a-z0-9-]+' | grep -v '^ph-fill$\|^ph-bold$' | sort -u
```

As of the most recent count (2026-04-27), the unique names are:
```
arrow-clockwise, arrow-left, arrow-right, arrow-up-right, bank,
briefcase, calendar-blank, calendar-check, calendar-plus, caret-down,
chart-line-up, check, check-circle, clock, currency-dollar, file-text,
github-logo, hand-heart, house, image-square, linkedin-logo, list,
microphone-slash, paper-plane-tilt, repeat, rss-simple, shield-check,
sign-in, speaker-high, sun, x-logo, youtube-logo
```

### 20 unique CMS-driven icons in `data/seed.json`
```
briefcase, camera, chalkboard-teacher, code, currency-circle-dollar,
device-mobile, eye-slash, gear, globe-hemisphere-east, graduation-cap,
hand-heart, house-line, magnifying-glass, map-pin, microphone,
pencil-line, scales, speaker-high, translate, users-three
```

### 6 components that render dynamic icon strings
- `components/donate/ImpactRow.tsx`
- `components/home/FeatureCard.tsx`
- `components/home/ValueCard.tsx`
- `components/projects/ProjectCard.tsx`
- `components/projects/ProjectDetail.tsx`
- `components/volunteers/RoleCard.tsx`

These all use the same shape:
```tsx
<i className={`ph ${icon}`} aria-hidden="true" />
```

After migration:
```tsx
<CmsIcon name={icon} aria-hidden="true" />
```

## Recommended PR sequence

This is a **three-PR migration**, not one big drop. Each PR is independently shippable and testable:

### PR 1 — Foundation: install + `CmsIcon` for the 6 dynamic components
**Branch:** `feat/phosphor-react-foundation`
**Scope:** ~7 files

- `npm install @phosphor-icons/react`
- New: `components/CmsIcon.tsx`
  ```tsx
  'use client';
  import {
    Briefcase, Camera, ChalkboardTeacher, Code, CurrencyCircleDollar,
    DeviceMobile, EyeSlash, Gear, GlobeHemisphereEast, GraduationCap,
    HandHeart, HouseLine, MagnifyingGlass, MapPin, Microphone,
    PencilLine, Scales, SpeakerHigh, Translate, UsersThree,
    type Icon,
  } from '@phosphor-icons/react';

  /** Allowlist of icon names the CMS may reference. To add an icon:
   *  add the import + map entry here, then ship. */
  const MAP: Record<string, Icon> = {
    'ph-briefcase': Briefcase,
    'ph-camera': Camera,
    'ph-chalkboard-teacher': ChalkboardTeacher,
    // ... all 20
  };

  type Weight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

  export default function CmsIcon({
    name, weight = 'regular', size = '1em', className, ...rest
  }: {
    name: string | null | undefined;
    weight?: Weight;
    size?: number | string;
    className?: string;
  } & React.SVGAttributes<SVGSVGElement>) {
    if (!name) return null;
    const Comp = MAP[name];
    if (!Comp) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[CmsIcon] unknown icon name: ${name}. Add it to MAP in components/CmsIcon.tsx`);
      }
      return null;
    }
    return <Comp weight={weight} size={size} className={className} {...rest} />;
  }
  ```
- Migrate the 6 dynamic-rendering components from `<i className={`ph ${icon}`} />` to `<CmsIcon name={icon} />`. Keep the surrounding `<div className="impact-icon">` etc. wrappers (they own the size + color).
- Tests: a small `tests/unit/cms-icon.test.tsx` verifying that:
  - Known name renders the right component
  - Unknown name renders `null`
  - Null/undefined name renders `null`
  - `weight="fill"` propagates

**Verification:** Build clean. `/`, `/about`, `/projects`, `/volunteers`, `/donate` all render correctly with no missing icons.

**The CDN font is still loaded.** This PR does not touch `app/layout.tsx`. Keeps the option to roll back the CmsIcon component without losing icons.

### PR 2 — Migrate hardcoded `<i>` tags, batched

Three small PRs is more reviewable than one big one. Suggested batches by surface area:

- **PR 2a** — Nav, Footer, AudioTour, VoiceAssistant (the always-mounted top-level chrome)
- **PR 2b** — Home, About, Projects detail pages
- **PR 2c** — Media (Photo, Podcast, Video components), Volunteer form, Donate widget, error/not-found pages

For each `<i>` tag:
```tsx
// before
<i className="ph ph-house" aria-hidden="true" />

// after
<House size="1em" aria-hidden="true" />

// before
<i className="ph-fill ph-heart" />

// after
<Heart weight="fill" size="1em" />
```

**Critical:** `size="1em"` matches the inherited-text-size behavior of the font icon. Without it, every icon defaults to 32 px — visually huge. Pages will look broken.

**Verification per batch:**
- Visual diff of the affected pages in light + dark + high-contrast
- No console warnings about unknown CmsIcon names (if a hardcoded callsite used a string-ish path it'd surface here)

### PR 3 — Drop the CDN, tighten CSP

**Branch:** `feat/drop-phosphor-cdn`

- `app/layout.tsx`: remove the three `<link rel="stylesheet">` tags pointing to `unpkg.com/@phosphor-icons/web`
- `vercel.json` CSP: drop `unpkg.com` from `style-src` and `font-src`
- Run a full visual regression sweep one more time

**This is the ONLY PR that risks breaking icons.** If any callsite was missed in PRs 2a–c, it'll silently disappear when the CDN font is gone. Smoke-test every page on a Vercel preview before merging.

## Files that change

(See PR sections above. Roughly: 1 new file in PR 1, ~6 in PR 1's migrations, ~10–15 per PR 2 batch, 2 in PR 3.)

## Verification checklist (per PR)
- [ ] `npm run typecheck` clean
- [ ] `npm run test:run` clean
- [ ] `npm run build` clean
- [ ] Visual sweep on a Vercel preview deployment: every public route, in light + dark + high-contrast
- [ ] Specifically check spots where icon sizing matters: nav burger, theme toggle button, social icons in footer, podcast player controls, donate heart, "read the full story" arrow
- [ ] No CSP violations in the browser console after PR 3

## Rollback
- Per-PR revert. PRs 1 and 2 leave the CDN load intact, so worst case icons fall back to the font automatically.
- PR 3's revert restores the CDN tags + the looser CSP.

## Estimated effort
- PR 1: ~3 hours
- PR 2 (3 sub-PRs): ~2 hours each = 6 hours
- PR 3: ~1 hour + however long the visual sweep takes

Total: ~1–1.5 days of focused work. Best done when you have a quiet stretch and someone to do visual QA on a preview.

## Risks I want to flag
- **The CMS icon allowlist is a workflow regression.** Today an admin who learns of a new Phosphor icon can use it immediately. After migration, they file a ticket, a developer adds the import + map entry, ships a deploy. Decide whether that's acceptable before starting.
- **Subtle visual shifts.** Font icons sit on the text baseline; SVGs sit slightly differently. Plan to spend time chasing 1–2 px alignment fixes in CTAs, input fields, etc.
- **Bundle size of `@phosphor-icons/react`.** Tree-shaking is per-import — if every component imports its own icons, the bundler dedupes correctly. If you do `import * as Icons from '@phosphor-icons/react'` anywhere, tree-shaking dies and the bundle balloons by 600+ KB.

---

# Cross-cutting items

## Test coverage
After all three land, expand the suite:
- `tests/unit/cms-icon.test.tsx` — known/unknown/null behavior
- `tests/api/confirm-token.test.ts` — token sign/verify
- `tests/api/donation-submission.test.ts` — parity with volunteer test (already overdue)
- `tests/unit/auth-v5.test.ts` — adapt the existing `auth.test.ts` to the v5 shape if anything moves

## CI workflow
`.github/workflows/ci.yml` should still pass without changes. After MED-9 the auth tests assert on the new exports.

## Deployment notes
- All three are independently deployable.
- MED-9 needs the AUTH_SECRET / NEXTAUTH_SECRET env var present on Vercel before deploy (no change needed unless renaming).
- MED-8 needs the email provider creds + sender DNS records before the route is live.
- MED-5 PR 3 needs the icons fully migrated in PRs 1 + 2 before merging — otherwise live icons break.

## When NOT to do these
- **MED-9 not during high-traffic windows.** It's the auth path; a bug locks out the dashboard.
- **MED-8 not before email DNS records propagate.** Emails will land in spam and confirmations silently fail.
- **MED-5 not the day before a content launch.** Visual QA takes time; an unscheduled icon regression on launch day is avoidable.

---

# Open questions for the team

1. (MED-8) **Which email provider?** Resend recommended. Need an account + a verified sender domain.
2. (MED-8) **Should the donation intent form require confirmation, or skip it?** Recommend require.
3. (MED-9) **Rename `NEXTAUTH_SECRET` → `AUTH_SECRET`?** Recommend yes for cleanliness, but it's optional.
4. (MED-5) **Allowlist or stay on CDN forever?** Migration is a workflow tradeoff, not a security necessity. Pick deliberately.
5. (Cross) **Who owns visual QA on Vercel previews?** Especially for MED-5.

Once these are answered, each item is a self-contained piece of work.
