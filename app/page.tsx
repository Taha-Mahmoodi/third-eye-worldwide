import Link from 'next/link';
import { getContent, visibleSorted } from '@/lib/cms/db';
import RichText from '@/components/RichText';
import JsonLd from '@/components/JsonLd';
import ImpactCell from '@/components/home/ImpactCell';
import StatBlock from '@/components/home/StatBlock';
import ValueCard from '@/components/home/ValueCard';
import HeroGraphics from '@/components/home/HeroGraphics';
import HeroActions from '@/components/home/HeroActions';
import StoryCard from '@/components/cards/StoryCard';
import TimelineRow from '@/components/cards/TimelineRow';
import ProjectCard from '@/components/projects/ProjectCard';
import { pageMetadata, readSeoOverrides, webPageJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const content = await getContent();
  const o = readSeoOverrides(content, '/');
  return pageMetadata({
    title: o.title || content?.site?.title,
    description: o.description,
    path: '/',
    image: o.image,
    noindex: o.noindex,
  });
}

export default async function HomePage() {
  const content = await getContent();
  const h = content?.home || {};
  const docs = content?.documents || {};
  const projectsSection = content?.projects || content?.programs || {};
  const impactStats = visibleSorted(h.impactStats || []);
  const statsBand   = visibleSorted(h.statsBand   || []);
  const values      = visibleSorted(h.coreValues  || []);
  const projectItems = visibleSorted(projectsSection.items || []);
  const stories     = visibleSorted(docs.stories  || []);
  const blogs       = visibleSorted(docs.blogs    || []);

  const showLiveLabel = h.liveLabelEnabled !== false && !!h.liveLabel;
  const showImpact    = h.impactEnabled    !== false && impactStats.length > 0;

  const latest = [stories[0], blogs[0], stories[1]].filter(Boolean);
  const timelineStories = stories.slice(0, 5);
  const featured = timelineStories[0] || docs.featuredStory || {};

  return (
    <>
      <JsonLd data={webPageJsonLd({ title: h.heroEyebrow ? 'Home' : undefined, path: '/' })} />
      <section className="hero">
        <div className="hero-photo" aria-hidden="true"></div>
        <HeroGraphics liveLabel={showLiveLabel ? h.liveLabel : null} />
        <div className="hero-inner">
          {h.heroEyebrow ? <div className="hero-eyebrow">{h.heroEyebrow}</div> : null}
          <RichText as="h1" className="hero-title" html={h.heroTitle || ''} />
          {showImpact && h.impactEyebrow ? (
            <div className="hero-impact-eyebrow">{h.impactEyebrow}</div>
          ) : null}
          {showImpact ? (
            <div className="hero-impact">
              {impactStats.map((s, i) => <ImpactCell key={s.id || i} stat={s} />)}
            </div>
          ) : null}
          <HeroActions />
        </div>
      </section>

      {statsBand.length > 0 ? (
        <div className="stats-band">
          <div className="section-inner">
            {statsBand.map((s, i) => <StatBlock key={s.id || i} stat={s} />)}
          </div>
        </div>
      ) : null}

      {values.length > 0 ? (
        <section className="values-section">
          <div className="values-bg" aria-hidden="true">
            <span className="vbg-ring r1"></span>
            <span className="vbg-ring r2"></span>
          </div>
          <div className="section-inner values-inner">
            <header className="values-head">
              {h.coreValuesEyebrow ? <div className="section-eyebrow">{h.coreValuesEyebrow}</div> : null}
              <RichText as="h2" className="values-title" html={h.coreValuesTitle || ''} />
              {h.coreValuesSub ? <p className="values-sub">{h.coreValuesSub}</p> : null}
            </header>
            <ol className="values-grid" role="list">
              {values.map((v, i) => <ValueCard key={v.id || i} value={v} />)}
            </ol>
          </div>
        </section>
      ) : null}

      {projectItems.length > 0 ? (
        <section className="section">
          <div className="section-inner">
            <div className="section-heading">
              <div className="section-eyebrow">What We Build</div>
              <h2 className="section-title">Voice-first tools, built with our community</h2>
              <p className="section-subtitle">
                Two active projects — a voice navigator for the web, and a social network for
                blind and low-vision users. Each starts from voice, not vision.
              </p>
            </div>
            <div className="home-projects-grid">
              {projectItems.map((p) => <ProjectCard key={p.id || p.slug} project={p} />)}
            </div>
          </div>
        </section>
      ) : null}

      {latest.length > 0 ? (
        <section className="section section-alt">
          <div className="section-inner">
            <div className="section-heading left" style={{ maxWidth: 720 }}>
              <div className="section-eyebrow">Latest Stories</div>
              <h2 className="section-title">Voices from our community</h2>
              <p className="section-subtitle">
                Real people, real independence. The work is never about us — it&apos;s about what
                becomes possible.
              </p>
            </div>
            <div className="doc-grid">
              {latest.map((s, i) => (
                <StoryCard key={s.id || i} story={s} featured={i === 0} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {timelineStories.length > 0 ? (
        <section className="story-timeline">
          <div className="section-inner">
            <header className="story-head">
              <div className="story-eyebrow">
                <span className="ribbon-dot"></span>
                <span>The Archive</span>
                <span className="story-count">· {new Date().getFullYear()}</span>
              </div>
              <h2 className="story-h2">
                Every story we&apos;ve published,
                <br />
                <em>newest first.</em>
              </h2>
            </header>

            <Link href="/documents#stories" className="story-featured" aria-label={featured.title}>
              <div className="sf-media" aria-hidden="true">
                <div className="sf-photo"></div>
                <svg className="sf-rings" viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="200" cy="200" r="60" />
                  <circle cx="200" cy="200" r="110" strokeDasharray="2 6" />
                  <circle cx="200" cy="200" r="160" />
                </svg>
                <div className="sf-badge">
                  <i className="ph-fill ph-star" aria-hidden="true"></i>
                  <span>Newest story</span>
                </div>
              </div>
              <div className="sf-body">
                <div className="sf-meta-top">
                  <span className="cat-tag story">Story</span>
                  <span className="sf-read">
                    <i className="ph ph-clock" aria-hidden="true"></i>{' '}
                    {featured.meta || featured.readTime || '8 min read'}
                  </span>
                </div>
                <h3 className="sf-title">{featured.title || ''}</h3>
                <p className="sf-excerpt">{featured.desc || featured.excerpt || ''}</p>
                <div className="sf-footer">
                  <div className="sf-author">
                    <div className="avatar lg" aria-hidden="true">{featured.initials || 'TE'}</div>
                    <div className="sf-author-text">
                      <div className="sf-author-name">{featured.author || ''}</div>
                    </div>
                  </div>
                  <span className="sf-read-btn" role="presentation">
                    Read the full story <i className="ph ph-arrow-up-right" aria-hidden="true"></i>
                  </span>
                </div>
              </div>
            </Link>

            <ol className="story-list" role="list">
              {timelineStories.map((s, i) => <TimelineRow key={s.id || i} story={s} />)}
            </ol>

            <div className="story-foot">
              <Link href="/documents#stories" className="btn-ghost">
                Browse the full archive <i className="ph ph-arrow-right" aria-hidden="true"></i>
              </Link>
              <div className="story-foot-meta">
                Updated weekly · {stories.length} stories in the archive
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="cta-band">
        <div className="cta-inner">
          <h2>Your support opens worlds.</h2>
          <p>
            $10 a month connects one user for a full year. Every contribution funds free tools,
            free training, and free devices for those who need them most.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/donate" className="btn-accent">
              <i className="ph-fill ph-heart" aria-hidden="true"></i> Donate Monthly
            </Link>
            <Link href="/volunteers" className="btn-secondary">Become a Volunteer</Link>
          </div>
        </div>
      </section>
    </>
  );
}
