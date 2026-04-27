import { Suspense } from 'react';
import Link from 'next/link';
import { getContent, visibleSorted } from '@/lib/cms/db';
import { SkeletonHero } from '@/components/Skeleton';
import RichText from '@/components/RichText';
import Subnav from '@/components/site/Subnav';
import FaqItem from '@/components/about/FaqItem';
import TeamCard from '@/components/about/TeamCard';
import BoardRow from '@/components/about/BoardRow';
import StatTile from '@/components/site/StatTile';
import { pageMetadata, readSeoOverrides } from '@/lib/seo';
import { HandHeart } from '@/components/icons';

// CMS-driven content. revalidatePath() in /api/cms/data covers
// publish events; the hourly fallback re-pulls if a publish was
// missed. Per HIGH-3.
export const revalidate = 3600;

export async function generateMetadata() {
  const content = await getContent();
  const o = readSeoOverrides(content, '/about');
  const a = content?.about || {};
  return pageMetadata({
    title: o.title || 'About — Third Eye Worldwide',
    description: o.description || a.heroSub || 'Our mission, our team, and the values that guide our work.',
    path: '/about',
    image: o.image,
    noindex: o.noindex,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FaqTab({ faqs }: { faqs: any[] }) {
  return (
    <section className="section">
      <div className="faq-wrap">
        <div className="faq-intro-row">
          <div>
            <span className="faq-counter">{faqs.length} Questions · {faqs.length} Answers</span>
            <h2>Everything you&apos;d want to ask on <em>day one.</em></h2>
          </div>
          <p>Tap any question to expand. No marketing fluff — just the things people actually ask us.</p>
        </div>

        {faqs.length > 0
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? faqs.map((f: any) => <FaqItem key={f.id || f.num} item={f} />)
          : <p style={{ color: 'var(--fg-muted)' }}>No questions yet.</p>}

        <div className="faq-cta">
          <div>
            <h3>Still have a question?</h3>
            <p>We publish answers to everything — press, partners, skeptics, job seekers.</p>
          </div>
          <div className="faq-cta-btns">
            <Link href="/volunteers" className="btn-primary">
              <HandHeart size="1em" aria-hidden="true" /> Join the team
            </Link>
            <Link href="/documents" className="btn-secondary">Read more</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

interface MissionContent { eyebrow?: string; title?: string; body?: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MissionTab({ missionStats, mission }: { missionStats: any[]; mission: MissionContent }) {
  const eyebrow = mission.eyebrow || 'Our Mission';
  const title   = mission.title   || 'Technology as the third eye.';
  const body    = mission.body    || '';

  return (
    <>
      <section className="section">
        <div className="section-inner">
          <div className="about-grid">
            <div>
              <div className="section-eyebrow" style={{ marginBottom: 14 }}>{eyebrow}</div>
              <h2 className="about-mission-title">{title}</h2>
              {body
                ? <RichText as="div" className="about-mission-body" html={body} />
                : null}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 24 }}>
                <Link href="/volunteers" className="btn-primary">
                  <HandHeart size="1em" aria-hidden="true" /> Join Us
                </Link>
                <Link href="/projects" className="btn-secondary">See Projects</Link>
              </div>
            </div>
            <div className="about-visual">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {missionStats.map((s: any, i: number) => <StatTile key={s.id || i} stat={s} />)}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="section-inner">
          <div className="section-heading">
            <div className="section-eyebrow">Our Pillars</div>
            <h2 className="section-title">What guides everything we build</h2>
          </div>
          <div className="pillars">
            <div className="pillar">
              <div className="num-badge">01</div>
              <h3>Radical Accessibility</h3>
              <p>Every product decision is evaluated first against a single question: can a
                visually impaired person use this independently?</p>
            </div>
            <div className="pillar">
              <div className="num-badge">02</div>
              <h3>Equity by Default</h3>
              <p>We design for low-bandwidth environments, older devices, and users who may not
                have a reliable data plan or power source.</p>
            </div>
            <div className="pillar">
              <div className="num-badge">03</div>
              <h3>Open by Default</h3>
              <p>All core tools are open source. Knowledge and access should never be gatekept by
                cost, geography, or language.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

interface BoardRecruit { title?: string; body?: string; ctaLabel?: string; ctaHref?: string }

interface TeamTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  team: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  board: any[];
  teamSubhead?: string;
  boardRecruit?: BoardRecruit;
}

function TeamTab({ team, board, teamSubhead, boardRecruit }: TeamTabProps) {
  const subhead = teamSubhead ||
    'A small, deliberate team. Our founder is visually impaired — every product decision passes through lived experience before it ships.';

  return (
    <>
      <section className="section">
        <div className="section-inner">
          <div className="section-heading">
            <div className="section-eyebrow">Leadership</div>
            <h2 className="section-title">The people behind TEWW</h2>
            <p className="section-subtitle">{subhead}</p>
          </div>

          <div className="team-grid">
            {team.length > 0
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ? team.map((m: any) => <TeamCard key={m.id || m.name} member={m} />)
              : <p style={{ color: 'var(--fg-muted)' }}>No team members yet.</p>}
          </div>

          {boardRecruit?.title || boardRecruit?.body ? (
            <div className="board-recruit-card">
              {boardRecruit.title ? <h3>{boardRecruit.title}</h3> : null}
              {boardRecruit.body ? <p>{boardRecruit.body}</p> : null}
              {boardRecruit.ctaLabel && boardRecruit.ctaHref ? (
                <a href={boardRecruit.ctaHref} className="btn-primary">
                  {boardRecruit.ctaLabel}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {board.length > 0 ? (
        <section className="section section-alt">
          <div className="section-inner">
            <div className="section-heading left" style={{ maxWidth: 720 }}>
              <div className="section-eyebrow">Board of Directors</div>
              <h2 className="section-title">Governance and oversight</h2>
              <p className="section-subtitle">
                An expert board providing disability-rights, governance, and open-tech oversight.
              </p>
            </div>
            <div className="board-card">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {board.map((m: any) => <BoardRow key={m.id || m.name} member={m} />)}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

export default function AboutPage() {
  return (
    <Suspense fallback={<SkeletonHero />}>
      <AboutPageContent />
    </Suspense>
  );
}

async function AboutPageContent() {
  const content = await getContent();
  const a = content?.about || {};
  const faqs = visibleSorted(a.faqs || []);
  const team = visibleSorted(a.team || []);
  const board = visibleSorted(a.board || []);
  const missionStats = visibleSorted(a.missionStats || []);
  const mission = (a.mission || {}) as MissionContent;
  const teamSubhead = a.teamSubhead as string | undefined;
  const boardRecruit = (a.boardRecruit || {}) as BoardRecruit;

  // Founder's Series — small, intentionally low-key section at the
  // bottom of /about, anchored at #founders-series. Not promoted on
  // home or on the main /documents archive (per content-update v2).
  // Chapter list mirrors documents.book.chapters so the source of
  // truth stays in one place.
  const founderSeries = (a.founderSeries || {}) as {
    eyebrow?: string; title?: string; body?: string;
    linkLabel?: string; linkHref?: string;
  };
  const bookChapters = visibleSorted(
    (content?.documents as { book?: { chapters?: unknown[] } } | null)?.book?.chapters || [],
  ) as Array<{ id?: string; num?: string; title?: string; readTime?: string; slug?: string }>;
  const showFounderSeries =
    !!(founderSeries.title || founderSeries.body) && bookChapters.length > 0;

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="section-eyebrow">{a.heroEyebrow || 'About Us'}</div>
          <RichText as="h1" html={a.heroTitle || 'About us.'} />
          {a.heroSub ? <p>{a.heroSub}</p> : null}
        </div>
      </div>

      <Subnav
        page="about"
        ariaLabel="About sections"
        defaultTab="faq"
        tabs={[
          { id: 'faq',     label: 'Overview', content: <FaqTab faqs={faqs} /> },
          { id: 'mission', label: 'Mission',  content: <MissionTab missionStats={missionStats} mission={mission} /> },
          { id: 'team',    label: 'Team',     content: <TeamTab team={team} board={board} teamSubhead={teamSubhead} boardRecruit={boardRecruit} /> },
        ]}
      />

      {showFounderSeries ? (
        <section className="section section-alt" id="founders-series">
          <div className="section-inner" style={{ maxWidth: 760 }}>
            <div className="section-heading left" style={{ textAlign: 'left', marginBottom: 24 }}>
              {founderSeries.eyebrow ? (
                <div className="section-eyebrow">{founderSeries.eyebrow}</div>
              ) : null}
              {founderSeries.title ? (
                <RichText as="h2" className="section-title" html={founderSeries.title} />
              ) : null}
              {founderSeries.body ? (
                <p className="section-subtitle" style={{ maxWidth: 'none' }}>
                  {founderSeries.body}
                </p>
              ) : null}
            </div>

            <ol className="founders-series-list" role="list">
              {bookChapters.map((c, i) => (
                <li key={c.id || i}>
                  <span className="fs-num">{c.num || String(i + 1).padStart(2, '0')}</span>
                  <span className="fs-title">{c.title}</span>
                  {c.readTime ? <span className="fs-time">{c.readTime}</span> : null}
                </li>
              ))}
            </ol>

            {founderSeries.linkLabel && founderSeries.linkHref ? (
              <div style={{ marginTop: 28 }}>
                <Link href={founderSeries.linkHref} className="btn-secondary">
                  {founderSeries.linkLabel}
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}
