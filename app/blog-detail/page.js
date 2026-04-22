import HtmlContent from '@/components/HtmlContent';
import { getContent } from '@/lib/cms/db';
import { renderBlogDetail } from '@/lib/pages/blog-detail';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Article — Third Eye Worldwide' };

export default async function BlogDetailPage({ searchParams }) {
  const slug = (await searchParams)?.slug;
  const content = await getContent();
  return <HtmlContent html={renderBlogDetail(content, slug)} />;
}
