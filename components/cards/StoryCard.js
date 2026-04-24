import Link from 'next/link';

/*
 * Shared story/blog card. Used on the home page "Latest Stories"
 * grid and on /documents.
 *
 * `story` shape (CMS): { title, desc, heroType, tagClass, tagLabel,
 *   img, initials, author, meta, readTime }.
 * `featured` adds the .featured modifier class.
 */
export default function StoryCard({ story, featured = false }) {
  const {
    heroType = 'type-story',
    tagClass = 'story',
    tagLabel = 'Story',
    img,
    title,
    desc,
    initials = 'TE',
    author = '',
    meta,
    readTime,
  } = story || {};

  const href = heroType === 'type-blog' ? '/documents#blogs' : '/documents#stories';
  const bgStyle = img
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.05) 30%, rgba(13,4,7,.75) 100%), url('${img}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  return (
    <Link
      className={`doc-card${featured ? ' featured' : ''}`}
      href={href}
      aria-label={title}
    >
      <div className={`doc-hero ${heroType}`} style={bgStyle}>
        <div>
          <span className={`cat-tag ${tagClass}`}>{tagLabel}</span>
          <h3>{title}</h3>
        </div>
      </div>
      <div className="doc-body">
        <p>{desc}</p>
        <div className="doc-meta">
          <div className="doc-author">
            <div className="avatar">{initials}</div>
            <span>{author}</span>
          </div>
          <span className="sep">·</span>
          <span>{meta || readTime || ''}</span>
        </div>
      </div>
    </Link>
  );
}
