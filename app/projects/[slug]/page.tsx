import { notFound } from 'next/navigation';
import { getContent, visibleSorted } from '@/lib/cms/db';
import JsonLd from '@/components/JsonLd';
import ProjectDetail, { type ProjectDetailData } from '@/components/projects/ProjectDetail';
import { pageMetadata, siteUrl, SITE } from '@/lib/seo';
import type { SiteContent } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface RouteProps {
  params: Promise<{ slug: string }>;
}

function findProject(content: SiteContent | null, slug: string): ProjectDetailData | null {
  const items = visibleSorted<ProjectDetailData>(content?.projects?.items || content?.programs?.items || []);
  return items.find((p) => p?.slug === slug) || null;
}

export async function generateMetadata({ params }: RouteProps) {
  const { slug } = await params;
  const content = await getContent();
  const project = findProject(content, slug);
  if (!project) return {};
  return pageMetadata({
    title: `${project.title} — Third Eye Worldwide`,
    description: project.desc,
    path: `/projects/${slug}`,
    type: 'article',
  });
}

export default async function ProjectDetailPage({ params }: RouteProps) {
  const { slug } = await params;
  const content = await getContent();
  const project = findProject(content, slug);
  if (!project) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.desc,
    url: siteUrl(`/projects/${slug}`),
    creator: { '@type': 'NGO', name: SITE.name, url: SITE.baseUrl },
    isPartOf: {
      '@type': 'CollectionPage',
      name: 'Projects',
      url: siteUrl('/projects'),
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ProjectDetail project={project} />
    </>
  );
}
