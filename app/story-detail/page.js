import HtmlContent from '@/components/HtmlContent';
import { getContent } from '@/lib/cms/db';
import { renderStoryDetail } from '@/lib/pages/story-detail';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Story — Third Eye Worldwide' };

export default async function StoryDetailPage({ searchParams }) {
  const slug = (await searchParams)?.slug;
  const content = await getContent();
  return <HtmlContent html={renderStoryDetail(content, slug)} />;
}
