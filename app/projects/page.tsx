import { Suspense } from 'react';
import Link from 'next/link';
import { getContent, visibleSorted } from '@/lib/cms/db';
import RichText from '@/components/RichText';
import { SkeletonHero } from '@/components/Skeleton';
import ProjectCard from '@/components/projects/ProjectCard';
import { pageMetadata, readSeoOverrides } from '@/lib/seo';
import { Heart } from '@/components/icons';

export const revalidate = 3600;

export async function generateMetadata() {
  const content = await getContent();
  const o = readSeoOverrides(content, '/projects');
  const p = content?.projects || content?.programs || {};
  return pageMetadata({
    title: o.title || `${p.heroEyebrow || 'Projects'} · Twelve projects. One goal.`,
    description: o.description || p.heroSub,
    path: '/projects',
    image: o.image,
    noindex: o.noindex,
  });
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<SkeletonHero />}>
      <ProjectsPageContent />
    </Suspense>
  );
}

async function ProjectsPageContent() {
  const content = await getContent();
  // Backward-compat with CMS data seeded before the Programs → Projects rename.
  const p = content?.projects || content?.programs || {};
  const items = visibleSorted(p.items || []);

  const heroEyebrow = p.heroEyebrow || 'Projects';
  const heroTitle   = p.heroTitle   || 'Our projects.';
  const heroSub     = p.heroSub     || '';

  const ctaHeading = p.ctaHeading || 'Support a project.';
  const ctaSub     = p.ctaSub     ||
    "Every project is funded by people like you. Pick one to sponsor, or let us direct your gift to where it's needed most.";

  // Optional CMS-driven "other work" block — three additional ecosystem
  // pieces (career service, news channel, story portal) that aren't yet
  // standalone project tiles. Per teww-cms-content-update-v2.md.
  const other = (p.otherWork || {}) as { title?: string; body?: string };

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="section-eyebrow">{heroEyebrow}</div>
          <RichText as="h1" html={heroTitle} />
          {heroSub ? <RichText as="p" html={heroSub} /> : null}
        </div>
      </div>

      <section className="section">
        <div className="section-inner">
          <div className="prog-grid">
            {items.length > 0 ? (
              items.map((it) => <ProjectCard key={it.id || it.title} project={it} />)
            ) : (
              <p style={{ gridColumn: '1 / -1', color: 'var(--fg-muted)' }}>No projects to show yet.</p>
            )}
          </div>
        </div>
      </section>

      {(other.title || other.body) ? (
        <section className="section section-alt">
          <div className="section-inner" style={{ maxWidth: 820 }}>
            {other.title ? <h2 className="section-title" style={{ marginBottom: 16 }}>{other.title}</h2> : null}
            {other.body ? <RichText as="p" className="section-subtitle" style={{ maxWidth: 'none' }} html={other.body} /> : null}
          </div>
        </section>
      ) : null}

      <section className="cta-band">
        <div className="cta-inner">
          <h2>{ctaHeading}</h2>
          <p>{ctaSub}</p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/donate" className="btn-accent">
              <Heart weight="fill" size="1em" aria-hidden="true" /> Donate Now
            </Link>
            <Link href="/volunteers" className="btn-secondary">Volunteer</Link>
          </div>
        </div>
      </section>
    </>
  );
}
