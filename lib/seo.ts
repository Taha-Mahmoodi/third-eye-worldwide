/*
 * Central SEO / metadata helper. Every route's `generateMetadata()`
 * funnels through `pageMetadata()` here so:
 *
 *   - Title template, site name, canonical base, OG image, Twitter
 *     handle, and social card type are set in exactly one place.
 *   - CMS overrides (content.seo) are respected without routes knowing
 *     they exist.
 *   - A page with no override still gets a decent OG card.
 *
 * Environment:
 *   NEXT_PUBLIC_SITE_URL — canonical base (no trailing slash). Defaults
 *   to the real production URL so relative OG/canonical URLs still
 *   resolve correctly even if the env var is missing.
 */

import type { Metadata } from 'next';
import type { SiteContent } from '@/lib/types';

export const SITE = {
  baseUrl: (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thirdeyeworldwide.org').replace(/\/$/, ''),
  name: 'Third Eye Worldwide',
  shortName: 'TEWW',
  tagline: 'A world beyond vision',
  description:
    'Third Eye Worldwide builds free, open-source voice-first assistive technology for blind and low-vision users — led by a visually impaired founder. A world beyond vision.',
  locale: 'en_US',
  twitter: '@thirdeyeworldwide',
  titleTemplate: '%s — Third Eye Worldwide',
  defaultTitle: 'Third Eye Worldwide — Technology that opens new worlds',
  orgLegalName: 'Third Eye Worldwide',
  orgType: 'NGO',
  founded: '2025',
} as const;

/** Return an absolute URL for a path (or pass through absolute URLs). */
export function siteUrl(path: string = '/'): string {
  if (!path) return SITE.baseUrl;
  if (/^https?:\/\//i.test(path)) return path;
  return SITE.baseUrl + (path.startsWith('/') ? path : '/' + path);
}

export interface SeoOverrides {
  title: string;
  description: string;
  image: string;
  noindex: boolean;
}

/**
 * Pluck the CMS-author's override for a given path, if any.
 * `content.seo.pages[path]` takes precedence over `content.seo` site defaults.
 */
export function readSeoOverrides(content: SiteContent | null | undefined, path: string): SeoOverrides {
  const seo = content?.seo || {};
  const pageOverride = seo.pages?.[path] || {};
  return {
    title: pageOverride.title ?? '',
    description: pageOverride.description ?? seo.defaultDescription ?? '',
    image: pageOverride.image ?? seo.defaultImage ?? '',
    noindex: Boolean(pageOverride.noindex),
  };
}

export interface PageMetadataInput {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article' | string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
}

/**
 * Build a Next.js Metadata object for a page. All fields have
 * defaults; callers only pass the ones that change.
 */
export function pageMetadata({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  noindex = false,
}: PageMetadataInput = {}): Metadata {
  const finalTitle = title || SITE.defaultTitle;
  const finalDescription = description || SITE.description;
  const canonical = siteUrl(path);
  const ogImage = image ? siteUrl(image) : undefined; // omit → let Next/app fall back to app/opengraph-image.js

  return {
    metadataBase: new URL(SITE.baseUrl),
    title: title ? { absolute: finalTitle } : SITE.defaultTitle,
    description: finalDescription,
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    openGraph: {
      type: type as 'website' | 'article',
      url: canonical,
      siteName: SITE.name,
      title: finalTitle,
      description: finalDescription,
      locale: SITE.locale,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE.twitter,
      creator: SITE.twitter,
      title: finalTitle,
      description: finalDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

/**
 * Organization JSON-LD. Rendered once from the root layout.
 */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: SITE.name,
    alternateName: SITE.shortName,
    url: SITE.baseUrl,
    logo: siteUrl('/assets/logo.svg'),
    description: SITE.description,
    foundingDate: SITE.founded,
    sameAs: [
      // Populated from CMS site.socials in a later PR; kept explicit here
      // so Search Console sees at least one canonical identity.
      'https://www.thirdeyeworldwide.org',
    ],
  };
}

export interface WebPageJsonLdInput {
  title?: string;
  description?: string;
  path?: string;
  type?: 'WebPage' | 'Article' | string;
}

/**
 * WebPage JSON-LD for an individual route.
 */
export function webPageJsonLd({
  title,
  description,
  path,
  type = 'WebPage',
}: WebPageJsonLdInput = {}): Record<string, unknown> {
  const url = siteUrl(path);
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name: title || SITE.defaultTitle,
    description: description || SITE.description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE.name,
      url: SITE.baseUrl,
    },
  };
}
