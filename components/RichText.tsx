/*
 * RichText — renders CMS-authored strings that may contain trusted
 * inline HTML (<em>, <br>, <strong>, <i>, etc). Content source is the
 * admin-authenticated CMS so it is rendered via dangerouslySetInnerHTML.
 *
 * Use for fields the CMS marks as "rich" (e.g. heroTitle, pullQuote).
 * For plain-text fields, pass the string as a normal JSX child — React
 * will escape it automatically.
 */
import type { ElementType, HTMLAttributes } from 'react';

interface RichTextProps extends Omit<HTMLAttributes<HTMLElement>, 'dangerouslySetInnerHTML'> {
  as?: ElementType;
  html?: string | null;
  className?: string;
}

export default function RichText({ as: Tag = 'span', html, className, ...rest }: RichTextProps) {
  if (html == null || html === '') return null;
  return (
    <Tag
      {...rest}
      className={className}
      dangerouslySetInnerHTML={{ __html: String(html) }}
    />
  );
}
