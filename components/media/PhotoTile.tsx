'use client';

import type { KeyboardEvent, MouseEvent } from 'react';

export interface PhotoData {
  id?: string;
  cls?: string;
  cat?: string;
  loc?: string;
  caption?: string;
  grad1?: string;
  grad2?: string;
  img?: string;
}

export default function PhotoTile({ photo }: { photo?: PhotoData }) {
  const {
    cls = 'p-4-2', cat = '', loc = '', caption = '',
    grad1 = '#1f61ff', grad2 = '#1349d4', img = '',
  } = photo || {};

  const gradient = `linear-gradient(135deg, ${grad1} 0%, ${grad2} 100%)`;

  function open(e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) {
    if (typeof window !== 'undefined' && typeof window.openPhotoLightbox === 'function') {
      window.openPhotoLightbox(e.currentTarget);
    }
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open(e);
    }
  }

  return (
    <div
      className={`photo-tile ${cls}`}
      data-filter-target="photos"
      data-cat={cat}
      style={{ background: gradient }}
      onClick={open}
      onKeyDown={onKey}
      tabIndex={0}
      role="button"
      aria-label={`${caption} — ${loc}`}
      data-bg={gradient}
      data-caption={caption}
      data-loc={loc}
      data-img={img}
    >
      {img ? (
        <div className="ph-img-bg" style={{ backgroundImage: `url('${img}')` }}></div>
      ) : (
        <div className="ph-placeholder"><i className="ph ph-image-square" aria-hidden="true"></i></div>
      )}
      <div className="overlay">
        <div className="ph-title">{caption}</div>
        <div className="ph-meta">{loc}</div>
      </div>
      <div className="photo-zoom-hint" aria-hidden="true">
        <i className="ph-bold ph-arrows-out"></i>
      </div>
    </div>
  );
}
