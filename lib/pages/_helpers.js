/*
 * Shared helpers used by every page renderer in lib/pages/.
 *
 * - esc(s):  escape HTML-unsafe characters. Use for any CMS-authored
 *            value that must render as plain text.
 * - rich(s): pass-through for CMS strings that contain intentional
 *            inline markup (e.g. <em>, <br>, <strong>). Trusted by
 *            contract — the CMS is the author of this content.
 */

export function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

// Unescaped — for CMS-authored strings that may contain <em>, <br>, <strong>, etc.
export function rich(s) {
  return s == null ? '' : String(s);
}
