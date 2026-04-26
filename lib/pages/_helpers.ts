/*
 * Shared helpers used by every page renderer in lib/pages/.
 *
 * - esc(s):  escape HTML-unsafe characters. Use for any CMS-authored
 *            value that must render as plain text.
 * - rich(s): pass-through for CMS strings that contain intentional
 *            inline markup (e.g. <em>, <br>, <strong>). Trusted by
 *            contract — the CMS is the author of this content.
 */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function esc(s: unknown): string {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c);
}

// Unescaped — for CMS-authored strings that may contain <em>, <br>, <strong>, etc.
export function rich(s: unknown): string {
  return s == null ? '' : String(s);
}
