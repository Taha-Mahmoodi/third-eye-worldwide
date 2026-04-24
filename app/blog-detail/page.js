import HtmlContent from '@/components/HtmlContent';
import { getContent, visibleSorted } from '@/lib/cms/db';
import { renderBlogDetail } from '@/lib/pages/blog-detail';
import { pageMetadata, readSeoOverrides } from '@/lib/seo';

/*
 * Static build: /blog-detail always renders the featured (or first)
 * blog entry. The dynamic version of this page used ?slug=... to pick
 * a post, which can't be pre-rendered. A follow-up can add
 * /blog-detail/[slug] with generateStaticParams for per-post pages.
 */

function featuredBlog(content) {
  const blogs = visibleSorted(content?.documents?.blogs || []);
  return blogs.find((b) => b.extra === 'featured') || blogs[0] || {};
}

export async function generateMetadata() {
  const content = await getContent();
  const post = featuredBlog(content);
  const o = readSeoOverrides(content, '/blog-detail');
  return pageMetadata({
    title: o.title || post.title || 'Article',
    description: o.description || post.desc || 'Research and field reporting from Third Eye Worldwide.',
    path: '/blog-detail',
    image: o.image || post.image,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    noindex: o.noindex,
  });
}

export default async function BlogDetailPage() {
  const content = await getContent();
  const post = featuredBlog(content);
  return <HtmlContent html={renderBlogDetail(content, post.id || post.slug)} />;
}
