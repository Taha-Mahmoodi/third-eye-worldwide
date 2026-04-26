'use client';

import { useState } from 'react';
import VideoCard, { type VideoData } from '@/components/media/VideoCard';

interface FilterableVideoGridProps {
  videos: VideoData[];
  cats: string[];
}

export default function FilterableVideoGrid({ videos, cats }: FilterableVideoGridProps) {
  const [filter, setFilter] = useState('all');
  const visible = filter === 'all' ? videos : videos.filter((v: VideoData) => v.cat === filter);

  return (
    <>
      {cats.length > 0 ? (
        <div className="filter-bar" data-filter-group="videos">
          <div className="filter-label">Category</div>
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

      <div className="video-grid">
        {visible.length > 0 ? (
          visible.map((v: VideoData) => <VideoCard key={v.id || v.title} video={v} />)
        ) : (
          <p style={{ gridColumn: '1 / -1', color: 'var(--fg-muted)' }}>
            {videos.length === 0 ? 'No videos yet.' : 'No videos match this filter.'}
          </p>
        )}
      </div>
    </>
  );
}
