import Link from 'next/link';

/*
 * Card that renders a single project in the /projects grid.
 *
 * CMS shape: { id, slug, icon, title, desc, tag, status, visible, order }.
 * When `slug` is present, the entire card becomes a link to
 * /projects/<slug>. Legacy items without a slug render as a plain div.
 */
export interface Project {
  id?: string;
  slug?: string;
  icon?: string;
  title?: string;
  desc?: string;
  tag?: string;
  status?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
export default function ProjectCard({ project }: { project?: Project }) {
  const { icon, title, desc, tag, slug, status } = project || {};
  const statusClass = status ? ` prog-card-${status}` : '';

  const inner = (
    <>
      <div className="prog-icon">
        <i className={`ph ${icon || 'ph-star'}`} aria-hidden="true"></i>
      </div>
      <div className="prog-content">
        <h3>{title || ''}</h3>
        <p>{desc || ''}</p>
        {tag ? <span className="prog-tag">{tag}</span> : null}
        {slug ? (
          <span className="prog-learn-more" aria-hidden="true">
            Learn more <i className="ph ph-arrow-right"></i>
          </span>
        ) : null}
      </div>
    </>
  );

  if (slug) {
    return (
      <Link
        href={`/projects/${slug}`}
        className={`prog-card prog-card-link${statusClass}`}
        aria-label={`${title} — learn more`}
      >
        {inner}
      </Link>
    );
  }

  return <div className={`prog-card${statusClass}`}>{inner}</div>;
}
