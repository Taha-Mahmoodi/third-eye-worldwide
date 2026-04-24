import HtmlContent from '@/components/HtmlContent';
import { getContent, visibleSorted } from '@/lib/cms/db';
import { renderStoryDetail } from '@/lib/pages/story-detail';
import { pageMetadata, readSeoOverrides } from '@/lib/seo';

export const dynamic = 'force-dynamic';

function resolveStory(content, slug) {
  const stories = visibleSorted(content?.documents?.stories || []);
  return (slug && stories.find((s) => s.id === slug || s.slug === slug)) || stories[0] || {};
}

export async function generateMetadata({ searchParams }) {
  const slug = (await searchParams)?.slug;
  const content = await getContent();
  const story = resolveStory(content, slug);
  const o = readSeoOverrides(content, '/story-detail');
  return pageMetadata({
    title: o.title || story.title || 'Story',
    description: o.description || story.desc || 'Stories from the community Third Eye Worldwide serves.',
    path: slug ? `/story-detail?slug=${encodeURIComponent(slug)}` : '/story-detail',
    image: o.image || story.image,
    type: 'article',
    publishedTime: story.publishedAt,
    modifiedTime: story.updatedAt,
    noindex: o.noindex,
  });
}

export default async function StoryDetailPage({ searchParams }) {
  const slug = (await searchParams)?.slug;
  const content = await getContent();
  return <HtmlContent html={renderStoryDetail(content, slug)} />;
}
