'use client';

import { useState } from 'react';
import DocCard from '@/components/documents/DocCard';

/*
 * Filter pills + card grid for the blogs subpage.
 * `cats` is the unique list of blog categories; 'all' is injected.
 *
 * Uses a single .doc-grid with auto-fit tracks so cards reflow
 * cleanly as the list is filtered (no JS chunking into fixed rows).
 */
interface Blog { id?: string; title?: string; cat?: string; [k: string]: unknown }
interface FilterableBlogGridProps {
  blogs: Blog[];
  cats: string[];
}

export default function FilterableBlogGrid({ blogs, cats }: FilterableBlogGridProps) {
  const [filter, setFilter] = useState('all');
  const visible = filter === 'all' ? blogs : blogs.filter((b: Blog) => b.cat === filter);

  return (
    <>
      {cats.length > 0 ? (
        <div className="filter-bar" data-filter-group="blogs">
          <div className="filter-label">Topic</div>
          <button
            type="button"
            className={`filter-pill${filter === 'all' ? ' active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {cats.map((c: string) => (
            <button
              key={c}
              type="button"
              className={`filter-pill${filter === c ? ' active' : ''}`}
              onClick={() => setFilter(c)}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      ) : null}

      {visible.length > 0 ? (
        <div className="doc-grid">
          {visible.map((b: Blog) => <DocCard key={b.id || b.title} doc={b} defaultKind="blog" />)}
        </div>
      ) : (
        <p style={{ color: 'var(--fg-muted)' }}>No posts match this filter.</p>
      )}

      {blogs.length > 9 ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
          <button type="button" className="btn-secondary">Load more posts</button>
        </div>
      ) : null}
    </>
  );
}
