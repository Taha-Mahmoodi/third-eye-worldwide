/**
 * Shared types for the CMS-driven content document.
 *
 * The document is stored as a JSON string in the SiteContent table so the CMS
 * can evolve the shape without migrations. These types describe the *known*
 * top-level structure but stay permissive (`any` index signatures) for
 * sub-trees the CMS may extend — pages access nested fields freely.
 *
 * Items in arrays carry the visibility/ordering metadata that
 * `visibleSorted()` in lib/cms/db.ts uses to filter and sort.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CmsItemMeta {
  visible?: boolean;
  order?: number;
  [key: string]: any;
}

export interface SeoPageOverride {
  title?: string;
  description?: string;
  image?: string;
  noindex?: boolean;
}

export interface SeoConfig {
  defaultDescription?: string;
  defaultImage?: string;
  pages?: Record<string, SeoPageOverride>;
}

export interface CmsBlogPost extends CmsItemMeta {
  id?: string;
  slug?: string;
  title?: string;
  desc?: string;
  tagLabel?: string;
  author?: string;
  initials?: string;
  role?: string;
  date?: string;
  meta?: string;
  readTime?: string;
}

export interface CmsStory extends CmsItemMeta {
  id?: string;
  slug?: string;
  title?: string;
  desc?: string;
  excerpt?: string;
  eyebrow?: string;
  author?: string;
  initials?: string;
  role?: string;
  date?: string;
  location?: string;
  meta?: string;
  readTime?: string;
}

export interface CmsFeaturedStory {
  title?: string;
  desc?: string;
  author?: string;
  initials?: string;
  eyebrow?: string;
}

export interface CmsDocuments {
  blogs?: CmsBlogPost[];
  stories?: CmsStory[];
  featuredStory?: CmsFeaturedStory;
  [key: string]: any;
}

export interface CmsPageSection extends CmsItemMeta {
  type?: 'hero' | 'text' | 'rich' | 'cta' | string;
  eyebrow?: string;
  title?: string;
  body?: string;
  heading?: string;
  html?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export interface CmsCustomPage extends CmsItemMeta {
  slug?: string;
  title?: string;
  sections?: CmsPageSection[];
}

export interface SiteContent {
  documents?: CmsDocuments;
  pages?: CmsCustomPage[];
  seo?: SeoConfig;
  updatedAt?: string;
  [key: string]: any;
}

/** Auth-related types */
export type UserRole = 'admin' | 'editor' | string;

export interface AdminAuthResult {
  via: 'token' | 'session';
  user?: {
    id?: string;
    email?: string | null;
    name?: string | null;
    role?: UserRole;
  };
}
