import Link from 'next/link';
import { getContent, visibleSorted } from '@/lib/cms/db';
import RichText from '@/components/RichText';
import Subnav from '@/components/site/Subnav';
import FaqItem from '@/components/about/FaqItem';
import TeamCard from '@/components/about/TeamCard';
import BoardRow from '@/components/about/BoardRow';
import StatTile from '@/components/site/StatTile';
import { pageMetadata, readSeoOverrides } from '@/lib/seo';


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

function FaqTab({ faqs }) {
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
          ? faqs.map((f) => <FaqItem key={f.id || f.num} item={f} />)
          : <p style={{ color: 'var(--fg-muted)' }}>No questions yet.</p>}

        <div className="faq-cta">
          <div>
            <h3>Still have a question?</h3>
            <p>We publish answers to everything — press, partners, skeptics, job seekers.</p>
          </div>
          <div className="faq-cta-btns">
            <Link href="/volunteers" className="btn-primary">
              <i className="ph ph-hand-heart" aria-hidden="true"></i> Join the team
            </Link>
            <Link href="/documents" className="btn-secondary">Read more</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function MissionTab({ missionStats }) {
  return (
    <>
      <section className="section">
        <div className="section-inner">
          <div className="about-grid">
            <div>
              <div className="section-eyebrow" style={{ marginBottom: 14 }}>Our Mission</div>
              <h2 className="about-mission-title">Technology as the third eye.</h2>
              <p className="about-mission-body">
                Founded in 2025 on a single belief: that technology should give visually impaired
                individuals the same digital access as everyone else — no compromise, no
                watered-down experience.
              </p>
              <p className="about-mission-body">
                Today we operate in one country, with three full-time staff and six active
                volunteers, building open-source voice-first tools for blind and low-vision
                users — led by a founder who lives the problem we build for.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 24 }}>
                <Link href="/volunteers" className="btn-primary">
                  <i className="ph ph-hand-heart" aria-hidden="true"></i> Join Us
                </Link>
                <Link href="/projects" className="btn-secondary">See Projects</Link>
              </div>
            </div>
            <div className="about-visual">
              {missionStats.map((s, i) => <StatTile key={s.id || i} stat={s} />)}
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

function TeamTab({ team, board }) {
  return (
    <>
      <section className="section">
        <div className="section-inner">
          <div className="section-heading">
            <div className="section-eyebrow">Leadership</div>
            <h2 className="section-title">The people behind TEWW</h2>
            <p className="section-subtitle">
              A small, deliberate team. Our founder is visually impaired — every product
              decision passes through lived experience before it ships.
            </p>
          </div>

          <div className="team-grid">
            {team.length > 0
              ? team.map((m) => <TeamCard key={m.id || m.name} member={m} />)
              : <p style={{ color: 'var(--fg-muted)' }}>No team members yet.</p>}
          </div>
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
              {board.map((m) => <BoardRow key={m.id || m.name} member={m} />)}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

export default async function AboutPage() {
  const content = await getContent();
  const a = content?.about || {};
  const faqs = visibleSorted(a.faqs || []);
  const team = visibleSorted(a.team || []);
  const board = visibleSorted(a.board || []);
  const missionStats = visibleSorted(a.missionStats || []);

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
          { id: 'mission', label: 'Mission',  content: <MissionTab missionStats={missionStats} /> },
          { id: 'team',    label: 'Team',     content: <TeamTab team={team} board={board} /> },
        ]}
      />
    </>
  );
}
