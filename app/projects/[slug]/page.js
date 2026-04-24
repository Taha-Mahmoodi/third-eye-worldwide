import { notFound } from 'next/navigation';
import { getContent, visibleSorted } from '@/lib/cms/db';
import JsonLd from '@/components/JsonLd';
import ProjectDetail from '@/components/projects/ProjectDetail';
import { pageMetadata, siteUrl, SITE } from '@/lib/seo';

// Enumerate every visible project slug so Next can pre-render one static
// HTML file per project at build time (/projects/<slug>/index.html).
// dynamicParams: false — requesting an unknown project slug 404s.
export const dynamicParams = false;

export async function generateStaticParams() {
  const content = await getContent();
  const items = visibleSorted(content?.projects?.items || content?.programs?.items || []);
  return items.filter((p) => p?.slug).map((p) => ({ slug: p.slug }));
}

function findProject(content, slug) {
  const items = visibleSorted(content?.projects?.items || content?.programs?.items || []);
  return items.find((p) => p?.slug === slug) || null;
}

export async function generateMetadata({ params }) {
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

export default async function ProjectDetailPage({ params }) {
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
