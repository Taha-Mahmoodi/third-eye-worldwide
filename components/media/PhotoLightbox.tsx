'use client';

import type * as React from 'react';

/*
 * Lightbox DOM used by /media#photos. Its open/close/nav behavior is
 * wired up by lib/client-init.js (window.openPhotoLightbox,
 * closePhotoLightbox, navLightbox). Component is purely presentational
 * — it just provides the DOM the globals expect.
 */
export default function PhotoLightbox() {
  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && typeof window !== 'undefined') {
      window.closePhotoLightbox?.();
    }
  }

  return (
    <div
      className="photo-lightbox"
      id="photoLightbox"
      role="dialog"
      aria-modal="true"
      aria-hidden="true"
      aria-label="Photo viewer"
      onClick={onBackdropClick}
    >
      <button
        type="button"
        className="lb-close"
        aria-label="Close photo"
        onClick={() => window.closePhotoLightbox?.()}
      >
        <i className="ph-bold ph-x" aria-hidden="true"></i>
      </button>
      <button
        type="button"
        className="lb-nav lb-prev"
        aria-label="Previous photo"
        onClick={() => window.navLightbox?.(-1)}
      >
        <i className="ph-bold ph-caret-left" aria-hidden="true"></i>
      </button>
      <button
        type="button"
        className="lb-nav lb-next"
        aria-label="Next photo"
        onClick={() => window.navLightbox?.(1)}
      >
        <i className="ph-bold ph-caret-right" aria-hidden="true"></i>
      </button>
      <figure className="lb-stage">
        <div className="lb-image" id="lbImage">
          <div className="lb-placeholder"><i className="ph ph-image-square" aria-hidden="true"></i></div>
        </div>
        <figcaption className="lb-caption">
          <div className="lb-meta">
            <span className="lb-loc" id="lbLoc"></span>
            <span className="lb-count" id="lbCount"></span>
          </div>
          <div className="lb-title" id="lbTitle"></div>
        </figcaption>
      </figure>
    </div>
  );
}
