import HtmlContent from '@/components/HtmlContent';
import { getContent, visibleSorted } from '@/lib/cms/db';
import { renderStoryDetail } from '@/lib/pages/story-detail';
import {
  isFounderSeriesSlug,
  renderFounderChapter,
  type BookChapter,
} from '@/lib/pages/founder-series';
import { pageMetadata, readSeoOverrides } from '@/lib/seo';
import type { SiteContent, CmsStory } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ slug?: string | string[] }>;
}

function resolveStory(content: SiteContent | null, slug?: string): CmsStory {
  const stories = visibleSorted<CmsStory>(content?.documents?.stories || []);
  return (slug && stories.find((s) => s.id === slug || s.slug === slug)) || stories[0] || {};
}

function resolveFounderChapter(content: SiteContent | null, slug?: string): BookChapter | null {
  if (!slug) return null;
  const chapters =
    (content?.documents as { book?: { chapters?: BookChapter[] } } | null)
      ?.book?.chapters || [];
  return chapters.find((c) => c?.slug === slug || c?.id === slug) || null;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const sp = await searchParams;
  const slug = typeof sp?.slug === 'string' ? sp.slug : undefined;
  const content = await getContent();
  const o = readSeoOverrides(content, '/story-detail');

  // Founder series chapters get their own metadata (memoir framing,
  // noindex by default since they're optional reading off the main
  // archive).
  if (isFounderSeriesSlug(slug)) {
    const c = resolveFounderChapter(content, slug);
    return pageMetadata({
      title: o.title || (c?.title ? `${c.title} — Founder's Series` : "Founder's Series"),
      description: o.description || c?.snippet ||
        "An excerpt from The Third Eye, a memoir-in-progress by Said Mohaddes Sadeqi.",
      path: `/story-detail?slug=${encodeURIComponent(slug!)}`,
      image: o.image,
      type: 'article',
      noindex: o.noindex !== false,  // default-noindex for memoir excerpts
    });
  }

  const story = resolveStory(content, slug);
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

export default async function StoryDetailPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const slug = typeof sp?.slug === 'string' ? sp.slug : undefined;
  const content = await getContent();

  // MED-5 PR 8: chapter slugs from `documents.book.chapters` render
  // through the founder-series template (first-person memoir variant)
  // instead of the community-profile template.
  if (isFounderSeriesSlug(slug)) {
    return <HtmlContent html={renderFounderChapter(content, slug)} />;
  }

  return <HtmlContent html={renderStoryDetail(content, slug)} />;
}
