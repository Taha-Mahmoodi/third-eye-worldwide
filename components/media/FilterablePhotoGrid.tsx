'use client';

import { useState } from 'react';
import PhotoTile, { type PhotoData } from '@/components/media/PhotoTile';

interface FilterablePhotoGridProps {
  photos: PhotoData[];
  cats: string[];
}

export default function FilterablePhotoGrid({ photos, cats }: FilterablePhotoGridProps) {
  const [filter, setFilter] = useState('all');
  const visible = filter === 'all' ? photos : photos.filter((p: PhotoData) => p.cat === filter);

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

      <div className="photo-grid">
        {visible.length > 0 ? (
          visible.map((p: PhotoData) => <PhotoTile key={p.id || p.caption} photo={p} />)
        ) : (
          <p style={{ gridColumn: '1 / -1', color: 'var(--fg-muted)' }}>
            {photos.length === 0 ? 'No photos yet.' : 'No photos match this filter.'}
          </p>
        )}
      </div>
    </>
  );
}
