import Link from 'next/link';

/*
 * Featured-story pull-quote card at the top of /documents#stories.
 * `fs` shape: { eyebrow, pullQuote, title, desc, author, authorRole, initials }.
 */
export default function FeaturedStory({ fs }) {
  if (!fs?.title) return null;
  const { eyebrow = 'Featured Story', pullQuote = '', title, desc = '', author = '', authorRole = '', initials = 'TE' } = fs;
  return (
    <article className="featured-story">
      <div className="fs-quote-panel">
        <div className="fs-quote-inner">
          <div className="fs-eyebrow">{eyebrow}</div>
          <div className="fs-quote-mark" aria-hidden="true">&ldquo;</div>
          <div className="fs-quote-text">{pullQuote}</div>
        </div>
        <div className="fs-quote-blob" aria-hidden="true"></div>
      </div>
      <div className="fs-body">
        <h3 className="fs-title">{title}</h3>
        <p className="fs-desc">{desc}</p>
        <div className="fs-author-row">
          <div className="fs-author-avatar" aria-hidden="true">{initials}</div>
          <div>
            <div className="fs-author-name">{author}</div>
            <div className="fs-author-role">{authorRole}</div>
          </div>
          <Link
            href="/story-detail"
            className="btn-primary fs-read-btn"
          >
            Read <i className="ph ph-arrow-right" aria-hidden="true"></i>
          </Link>
        </div>
      </div>
    </article>
  );
}
