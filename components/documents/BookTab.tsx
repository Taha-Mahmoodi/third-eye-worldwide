import RichText from '@/components/RichText';
import { Books, Clock } from '@/components/icons';

/*
 * Documents → Book tab. Renders the founder's memoir-in-progress
 * snippets — a small section that lives alongside Stories and Blogs
 * but is intentionally lower-key. Per teww-cms-content-update-v2.md,
 * the founder's voice belongs in a contained place, not promoted on
 * the home page or main archive.
 */

export interface BookChapter {
  id?: string;
  num?: string;
  title?: string;
  readTime?: string;
  status?: string;
  snippet?: string;
  slug?: string;
  visible?: boolean;
}

export interface BookContent {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  intro?: string;
  chapters?: BookChapter[];
}

export default function BookTab({ book }: { book: BookContent }) {
  const chapters = (book.chapters || []).filter((c) => c?.visible !== false);

  return (
    <section className="section">
      <div className="section-inner">
        <div className="book-intro">
          <div className="section-eyebrow">{book.eyebrow || 'From the Book'}</div>
          <RichText as="h2" className="section-title book-title" html={book.title || 'The Book.'} />
          {book.subtitle ? (
            <div className="book-byline">
              <Books size="1em" aria-hidden="true" />
              <span>{book.subtitle}</span>
            </div>
          ) : null}
          {book.intro ? <p className="book-intro-text">{book.intro}</p> : null}
        </div>

        {chapters.length > 0 ? (
          <ol className="book-chapters" role="list">
            {chapters.map((c, i) => (
              <li key={c.id || i} className="book-chapter">
                <div className="book-chapter-meta">
                  <span className="book-chapter-num" aria-hidden="true">
                    {c.num || String(i + 1).padStart(2, '0')}
                  </span>
                  {c.readTime ? (
                    <span className="book-chapter-readtime">
                      <Clock size="1em" aria-hidden="true" /> {c.readTime}
                    </span>
                  ) : null}
                </div>
                <h3 className="book-chapter-title">{c.title || ''}</h3>
                {c.snippet ? <p className="book-chapter-snippet">{c.snippet}</p> : null}
                {c.status ? (
                  <div className="book-chapter-status">{c.status}</div>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <p style={{ color: 'var(--fg-muted)' }}>Chapters arriving soon.</p>
        )}

        <p className="book-foot">
          The book is in progress. Excerpts will publish here as chapters
          finalise — subscribe via the newsletter on the Blogs tab to be
          notified.
        </p>
      </div>
    </section>
  );
}
