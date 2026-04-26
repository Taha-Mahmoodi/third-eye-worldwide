import Link from 'next/link';

/*
 * Documents blog/story tile. Renders as a full-card link.
 *
 * `doc` shape: { title, desc, heroType, tagClass, tagLabel, cat,
 *                author, initials, meta, readTime, extra }.
 * `defaultKind` decides the link target when tagClass isn't set.
 */
interface Doc {
  tagClass?: string;
  heroType?: string;
  tagLabel?: string;
  extra?: string;
  cat?: string;
  title?: string;
  desc?: string;
  author?: string;
  initials?: string;
  meta?: string;
  readTime?: string;
  id?: string;
}
interface DocCardProps {
  doc?: Doc;
  defaultKind?: 'blog' | 'story';
}

export default function DocCard({ doc, defaultKind = 'blog' }: DocCardProps) {
  const {
    tagClass, heroType, tagLabel, extra, cat,
    title, desc, author, initials = 'TE', meta, readTime,
  } = doc || {};

  const kind = tagClass === 'story' ? 'story' : 'blog';
  const href = kind === 'story' ? '/story-detail' : '/blog-detail';
  const displayHero = heroType || (kind === 'story' ? 'type-story' : 'type-blog');
  const displayTagClass = tagClass || defaultKind;
  const displayTagLabel = tagLabel || (defaultKind === 'story' ? 'Story' : 'Blog');

  return (
    <Link
      className={`doc-card ${extra || ''}`.trim()}
      href={href}
      aria-label={`Read: ${title}`}
      data-cat={cat || ''}
    >
      <div className={`doc-hero ${displayHero}`}>
        <div>
          <span className={`cat-tag ${displayTagClass}`}>{displayTagLabel}</span>
          <h3>{title}</h3>
        </div>
      </div>
      <div className="doc-body">
        <p>{desc}</p>
        <div className="doc-meta">
          <div className="doc-author">
            <div className="avatar">{initials}</div>
            <span>{author || ''}</span>
          </div>
          <span className="sep">·</span>
          <span>{meta || readTime || ''}</span>
        </div>
      </div>
    </Link>
  );
}
