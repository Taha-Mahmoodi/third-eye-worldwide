import { notFound } from 'next/navigation';
import HtmlContent from '@/components/HtmlContent';
import { getContent } from '@/lib/cms/db';
import { findCustomPage, renderCustomPage } from '@/lib/pages/custom';

export const dynamic = 'force-dynamic';

// Reserved slugs that already resolve to concrete routes; must not be shadowed
// by a user-defined page slug.
const RESERVED = new Set([
  'about', 'programs', 'donate', 'media', 'documents',
  'volunteers', 'blog-detail', 'story-detail', 'admin', 'api',
]);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (RESERVED.has(slug)) return {};
  const content = await getContent();
  const page = findCustomPage(content, slug);
  if (!page) return {};
  return { title: (page.title || slug) + ' — Third Eye Worldwide' };
}

export default async function CustomPage({ params }) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();
  const content = await getContent();
  const page = findCustomPage(content, slug);
  if (!page) notFound();
  return <HtmlContent html={renderCustomPage(page)} />;
}
