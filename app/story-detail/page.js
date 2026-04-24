import HtmlContent from '@/components/HtmlContent';
import { getContent, visibleSorted } from '@/lib/cms/db';
import { renderStoryDetail } from '@/lib/pages/story-detail';
import { pageMetadata, readSeoOverrides } from '@/lib/seo';

/*
 * Static build: /story-detail always renders the featured (or first)
 * story entry. A follow-up can add /story-detail/[slug] with
 * generateStaticParams for per-story pages.
 */

function featuredStory(content) {
  const stories = visibleSorted(content?.documents?.stories || []);
  return stories.find((s) => s.extra === 'featured') || stories[0] || {};
}

export async function generateMetadata() {
  const content = await getContent();
  const story = featuredStory(content);
  const o = readSeoOverrides(content, '/story-detail');
  return pageMetadata({
    title: o.title || story.title || 'Story',
    description: o.description || story.desc || 'Stories from the community Third Eye Worldwide serves.',
    path: '/story-detail',
    image: o.image || story.image,
    type: 'article',
    publishedTime: story.publishedAt,
    modifiedTime: story.updatedAt,
    noindex: o.noindex,
  });
}

export default async function StoryDetailPage() {
  const content = await getContent();
  const story = featuredStory(content);
  return <HtmlContent html={renderStoryDetail(content, story.id || story.slug)} />;
}
