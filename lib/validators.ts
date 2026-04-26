/**
 * Shared input validators used by both client forms and server-side
 * route handlers. Any validation that's expressed in more than one
 * place should live here so the client and server agree.
 *
 * Per MED-2 in CODEBASE_REVIEW.md.
 */

/**
 * Conservative single-line email check. Not a full RFC 5322 parser —
 * we only want to catch obvious typos before hitting the database.
 * The real validity test is whether the user can read mail at the
 * address, which is out of scope here.
 *
 * Rules:
 *   - exactly one `@` sign
 *   - non-empty local-part with no whitespace
 *   - non-empty domain with at least one dot
 *   - 2+ chars after the final dot
 *
 * Tighter than the previous `/\S+@\S+\.\S+/` form used in client
 * components — that one accepted `a@b.c`, which usually isn't a
 * deliverable address.
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;
  return EMAIL_RE.test(email.trim());
}
