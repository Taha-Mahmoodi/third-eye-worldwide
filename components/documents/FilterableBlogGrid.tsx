'use client';

import { useState } from 'react';
import DocCard from '@/components/documents/DocCard';
import { cn } from '@/lib/utils';

/*
 * Filter pills + card grid for the blogs subpage.
 * `cats` is the unique list of blog categories; 'all' is injected.
 *
 * Uses a single .doc-grid with auto-fit tracks so cards reflow
 * cleanly as the list is filtered (no JS chunking into fixed rows).
 */
export interface Blog {
  id?: string;
  title?: string;
  cat?: string;
  excerpt?: string;
  [k: string]: unknown;
}
export interface FilterableBlogGridProps {
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
            className={cn('filter-pill', { active: filter === 'all' })}
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {cats.map((c: string) => (
            <button
              key={c}
              type="button"
              className={cn('filter-pill', { active: filter === c })}
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      ) : null}

      {blogs.length === 0 ? (
        <p className="grid-empty">No posts published yet. Check back soon.</p>
      ) : visible.length === 0 ? (
        <p className="grid-empty">No posts match this filter.</p>
      ) : (
        <div className="doc-grid">
          {visible.map((b: Blog) => <DocCard key={b.id || b.title} doc={b} defaultKind="blog" />)}
        </div>
      )}
    </>
  );
}
