/*
 * RichText — renders CMS-authored strings that may contain trusted
 * inline HTML (<em>, <br>, <strong>, <i>, etc). Content source is the
 * admin-authenticated CMS, but we still sanitize at render time as
 * defense-in-depth: a compromised admin account, a SQL-level injection,
 * or a future migration that pulls user-submitted text into a "rich"
 * field would otherwise turn directly into XSS.
 *
 * Sanitization uses isomorphic-dompurify which works on both server
 * (jsdom-based) and client. We restrict to a tiny tag/attr allow-list
 * because none of the CMS rich fields need anything bigger.
 *
 * Use for fields the CMS marks as "rich" (e.g. heroTitle, pullQuote).
 * For plain-text fields, pass the string as a normal JSX child — React
 * will escape it automatically.
 */
import type { ElementType, HTMLAttributes } from 'react';
import DOMPurify from 'isomorphic-dompurify';

// Tags allowed inside CMS rich fields. Anything outside this list is
// stripped (the inner text is preserved). Keep this list as small as
// possible — every additional tag widens the XSS surface.
const ALLOWED_TAGS = ['em', 'i', 'strong', 'b', 'br', 'span', 'sup', 'sub', 'mark', 'u'];
const ALLOWED_ATTR = ['class'];

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Belt-and-suspenders: explicitly forbid anything that could load
    // remote content or execute script even if it slipped through.
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'srcdoc', 'href', 'src'],
  });
}

interface RichTextProps extends Omit<HTMLAttributes<HTMLElement>, 'dangerouslySetInnerHTML'> {
  as?: ElementType;
  html?: string | null;
  className?: string;
}

export default function RichText({ as: Tag = 'span', html, className, ...rest }: RichTextProps) {
  if (html == null || html === '') return null;
  const safe = sanitize(String(html));
  if (safe === '') return null;
  return (
    <Tag
      {...rest}
      className={className}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
