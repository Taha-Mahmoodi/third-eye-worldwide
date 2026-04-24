'use client';

import { useState } from 'react';
import PhotoTile from '@/components/media/PhotoTile';

export default function FilterablePhotoGrid({ photos, cats }) {
  const [filter, setFilter] = useState('all');
  const visible = filter === 'all' ? photos : photos.filter((p) => p.cat === filter);

  return (
    <>
      {cats.length > 0 ? (
        <div className="filter-bar" data-filter-group="photos">
          <div className="filter-label">Filter</div>
          <button
            type="button"
            className={`filter-pill${filter === 'all' ? ' active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {cats.map((c) => (
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

      <div className="photo-grid">
        {visible.length > 0 ? (
          visible.map((p) => <PhotoTile key={p.id || p.caption} photo={p} />)
        ) : (
          <p style={{ gridColumn: '1 / -1', color: 'var(--fg-muted)' }}>
            {photos.length === 0 ? 'No photos yet.' : 'No photos match this filter.'}
          </p>
        )}
      </div>
    </>
  );
}
