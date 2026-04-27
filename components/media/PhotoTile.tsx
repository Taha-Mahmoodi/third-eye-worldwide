'use client';

import type { MouseEvent } from 'react';
import { ArrowsOut, ImageSquare } from '@/components/icons';
import { isSafeImageUrl } from '@/lib/utils';

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

export interface PhotoTileProps {
  photo?: PhotoData;
}

/*
 * Photo tile that opens the lightbox on click. Uses a native
 * <button> rather than role="button" on a div — the browser handles
 * keyboard focus, Enter/Space activation, and focus-visible styling
 * automatically. Default button chrome is stripped via `all: unset`
 * in globals.css with the photo-tile base styles re-applied.
 */
export default function PhotoTile({ photo }: PhotoTileProps) {
  const {
    cls = 'p-4-2', cat = '', loc = '', caption = '',
    grad1 = '#1f61ff', grad2 = '#1349d4', img = '',
  } = photo || {};

  const gradient = `linear-gradient(135deg, ${grad1} 0%, ${grad2} 100%)`;
  const safeImg = isSafeImageUrl(img) ? img : '';

  function open(e: MouseEvent<HTMLButtonElement>) {
    if (typeof window !== 'undefined' && typeof window.openPhotoLightbox === 'function') {
      window.openPhotoLightbox(e.currentTarget);
    }
  }

  return (
    <button
      type="button"
      className={`photo-tile ${cls}`}
      data-filter-target="photos"
      data-cat={cat}
      style={{ background: gradient }}
      onClick={open}
      aria-label={`${caption} — ${loc}`}
      data-bg={gradient}
      data-caption={caption}
      data-loc={loc}
      data-img={safeImg}
    >
      {safeImg ? (
        <div className="ph-img-bg" style={{ backgroundImage: `url('${safeImg}')` }}></div>
      ) : (
        <div className="ph-placeholder"><ImageSquare size="1em" aria-hidden="true" /></div>
      )}
      <div className="overlay">
        <div className="ph-title">{caption}</div>
        <div className="ph-meta">{loc}</div>
      </div>
      <div className="photo-zoom-hint" aria-hidden="true">
        <ArrowsOut weight="bold" size="1em" aria-hidden="true" />
      </div>
    </button>
  );
}
