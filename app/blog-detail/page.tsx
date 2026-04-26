import HtmlContent from '@/components/HtmlContent';
import { getContent, visibleSorted } from '@/lib/cms/db';
import { renderBlogDetail } from '@/lib/pages/blog-detail';
import { pageMetadata, readSeoOverrides } from '@/lib/seo';
import type { SiteContent, CmsBlogPost } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ slug?: string | string[] }>;
}

function resolveBlog(content: SiteContent | null, slug?: string): CmsBlogPost {
  const blogs = visibleSorted<CmsBlogPost>(content?.documents?.blogs || []);
  return (slug && blogs.find((b) => b.id === slug || b.slug === slug)) || blogs[0] || {};
}

export async function generateMetadata({ searchParams }: PageProps) {
  const sp = await searchParams;
  const slug = typeof sp?.slug === 'string' ? sp.slug : undefined;
  const content = await getContent();
  const post = resolveBlog(content, slug);
  const o = readSeoOverrides(content, '/blog-detail');
  return pageMetadata({
    title: o.title || post.title || 'Article',
    description: o.description || post.desc || 'Research and field reporting from Third Eye Worldwide.',
    path: slug ? `/blog-detail?slug=${encodeURIComponent(slug)}` : '/blog-detail',
    image: o.image || post.image,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    noindex: o.noindex,
  });
}

export default async function BlogDetailPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const slug = typeof sp?.slug === 'string' ? sp.slug : undefined;
  const content = await getContent();
  return <HtmlContent html={renderBlogDetail(content, slug)} />;
}
