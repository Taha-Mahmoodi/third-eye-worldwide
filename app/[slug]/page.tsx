import { notFound } from 'next/navigation';
import HtmlContent from '@/components/HtmlContent';
import { getContent } from '@/lib/cms/db';
import { findCustomPage, renderCustomPage } from '@/lib/pages/custom';
import { pageMetadata, readSeoOverrides } from '@/lib/seo';

export const dynamic = 'force-dynamic';

// Reserved slugs that already resolve to concrete routes; must not be shadowed
// by a user-defined page slug.
const RESERVED = new Set([
  'about', 'programs', 'projects', 'donate', 'media', 'documents',
  'volunteers', 'blog-detail', 'story-detail', 'coming-soon', 'admin', 'api',
]);

interface SlugRouteProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SlugRouteProps) {
  const { slug } = await params;
  if (RESERVED.has(slug)) return {};
  const content = await getContent();
  const page = findCustomPage(content, slug);
  if (!page) return {};
  const o = readSeoOverrides(content, '/' + slug);
  return pageMetadata({
    title: o.title || (page.title || slug),
    description: o.description || page.description || page.excerpt,
    path: '/' + slug,
    image: o.image || page.image,
    noindex: o.noindex,
  });
}

export default async function CustomPage({ params }: SlugRouteProps) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();
  const content = await getContent();
  const page = findCustomPage(content, slug);
  if (!page) notFound();
  return <HtmlContent html={renderCustomPage(page)} />;
}
