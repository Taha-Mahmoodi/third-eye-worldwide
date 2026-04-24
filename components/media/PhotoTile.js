'use client';

/*
 * Single photo tile in the /media#photos grid. Clicking it opens the
 * lightbox via the global exposed by lib/client-init.js. The data-*
 * attributes carry the image metadata so the lightbox can read them.
 *
 * `photo` shape: { cls, cat, loc, caption, grad1, grad2, img }.
 */
export default function PhotoTile({ photo }) {
  const {
    cls = 'p-4-2', cat = '', loc = '', caption = '',
    grad1 = '#1f61ff', grad2 = '#1349d4', img = '',
  } = photo || {};

  const gradient = `linear-gradient(135deg, ${grad1} 0%, ${grad2} 100%)`;

  function open(e) {
    if (typeof window !== 'undefined' && typeof window.openPhotoLightbox === 'function') {
      window.openPhotoLightbox(e.currentTarget);
    }
  }

  function onKey(e) {
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
