import Link from 'next/link';
import RichText from '@/components/RichText';

/*
 * Renders a single project's detail view. Shape expected:
 *   { title, desc, icon, tag, slug, status, statusLabel,
 *     what, how, why, usage, future }
 *
 * Long-form sections are passed through RichText so CMS editors can
 * include <em>/<strong>/<br> without escaping.
 */

const SECTIONS = [
  { key: 'what',   eyebrow: 'What it is',     label: 'What is it?' },
  { key: 'how',    eyebrow: 'How it works',   label: 'How does it work?' },
  { key: 'why',    eyebrow: 'The reason',     label: 'Why we built it' },
  { key: 'usage',  eyebrow: 'In practice',    label: 'How is it used?' },
  { key: 'future', eyebrow: 'What\u2019s next', label: 'What\u2019s the future of it?' },
];

export default function ProjectDetail({ project }) {
  const { title, desc, icon, status, statusLabel } = project || {};

  return (
    <article className="project-detail">
      <header className="pd-hero">
        <div className="pd-hero-inner">
          <Link href="/projects" className="pd-back">
            <i className="ph ph-arrow-left" aria-hidden="true"></i>
            Back to projects
          </Link>
          <div className="pd-hero-top">
            <div className="pd-hero-icon" aria-hidden="true">
              <i className={`ph ${icon || 'ph-star'}`}></i>
            </div>
            {statusLabel ? (
              <span className={`pd-status pd-status-${status || 'info'}`}>
                <span className="pd-status-dot" aria-hidden="true"></span>
                {statusLabel}
              </span>
            ) : null}
          </div>
          <h1 className="pd-title">{title}</h1>
          {desc ? <p className="pd-standfirst">{desc}</p> : null}
        </div>
      </header>

      <div className="pd-body">
        {SECTIONS.map(({ key, eyebrow, label }) => (
          project[key] ? (
            <section key={key} className="pd-section" aria-labelledby={`pd-s-${key}`}>
              <div className="pd-section-eyebrow">{eyebrow}</div>
              <h2 id={`pd-s-${key}`} className="pd-section-title">{label}</h2>
              <RichText as="div" className="pd-section-body" html={project[key]} />
            </section>
          ) : null
        ))}
      </div>

      <section className="pd-cta">
        <h2>Support projects like this.</h2>
        <p>Every dollar funds open-source tools that are free at point of use — and stay that way.</p>
        <div className="pd-cta-actions">
          <Link href="/donate" className="btn-accent">
            <i className="ph-fill ph-heart" aria-hidden="true"></i> Donate
          </Link>
          <Link href="/volunteers" className="btn-secondary">
            Volunteer
          </Link>
        </div>
      </section>
    </article>
  );
}
