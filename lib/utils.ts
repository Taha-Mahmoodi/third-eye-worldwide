import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/*
 * Allowlist for CMS-provided image URLs that get inlined as
 * `background-image: url(...)`. Inline `url()` is a CSS-injection
 * vector if the source isn't trusted (a CMS editor could paste a
 * `javascript:` URI or a tracking pixel from a sketchy origin), so
 * we only render the image when its origin is on the allowlist.
 *
 * Keep this list aligned with `next.config.mjs` `images.remotePatterns`
 * — anything renderable via <Image> should also be allowlisted here.
 * Relative paths (no origin) are also accepted as same-origin assets.
 */
const ALLOWED_IMG_ORIGINS = [
  'https://images.unsplash.com',
  'https://www.thirdeyeworldwide.org',
  'https://thirdeyeworldwide.org',
];

export function isSafeImageUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  // Relative paths (e.g. "/uploads/foo.jpg") are same-origin and safe.
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  try {
    const { origin, protocol } = new URL(url);
    if (protocol !== 'https:' && protocol !== 'http:') return false;
    return ALLOWED_IMG_ORIGINS.includes(origin);
  } catch {
    return false;
  }
}
