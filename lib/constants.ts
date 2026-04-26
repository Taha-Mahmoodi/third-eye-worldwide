/**
 * Single source of truth for magic numbers used across the app.
 * Anything that gates behavior — limits, retention windows, payload
 * sizes — should live here so callers don't disagree about the value
 * and so changes need touching only one file.
 *
 * Per LOW-2 in CODEBASE_REVIEW.md.
 */

// ── Donations ────────────────────────────────────────────────────
// MAX was previously 1_000_000 in the donation route — knocked down
// to 50 000 because (a) a million-dollar single submission would
// almost always be a typo or abuse and (b) any real ultra-major
// gift would go through a separate human-led flow anyway.
export const MIN_DONATION_AMOUNT = 1;
export const MAX_DONATION_AMOUNT = 50_000;

// ── Form rate limiting (used by lib/rate-limit.ts) ───────────────
// 20 submissions per 15-minute window per IP, applied separately to
// volunteer and donation endpoints.
export const RATE_LIMIT_MAX_REQUESTS = 20;
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

// ── CMS payload size ─────────────────────────────────────────────
// PUT /api/cms/data refuses bodies bigger than this. Site content is
// well under 1 MB in practice; anything bigger is either accidental
// or hostile.
export const CMS_MAX_PAYLOAD_BYTES = 2 * 1024 * 1024;

// ── ContentRevision retention (used by MED-4) ────────────────────
// Number of historical CMS revisions to keep. Older revisions are
// pruned on each successful publish.
export const CONTENT_REVISION_KEEP_COUNT = 20;

// ── Auth session lifetime ────────────────────────────────────────
// 12 hours of NextAuth JWT validity for admin sessions.
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
