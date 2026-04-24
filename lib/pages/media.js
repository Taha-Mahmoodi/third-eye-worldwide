import { visibleSorted } from '@/lib/cms/db';

import { esc, rich } from '@/lib/pages/_helpers';

function photoTile(it) {
  const cls = esc(it.cls || 'p-4-2');
  const cat = esc(it.cat || '');
  const loc = it.loc || '';
  const caption = it.caption || '';
  const grad1 = esc(it.grad1 || '#1f61ff');
  const grad2 = esc(it.grad2 || '#1349d4');
  const img = it.img || '';
  const bg = `linear-gradient(135deg, ${grad1} 0%, ${grad2} 100%)`;
  const safeBg = esc(bg);
  const safeCap = esc(caption);
  const safeLoc = esc(loc);
  const imgLayer = img
    ? `<div class="ph-img-bg" style="background-image: url('${esc(img)}');"></div>`
    : `<div class="ph-placeholder"><i class="ph ph-image-square"></i></div>`;
  return `<div class="photo-tile ${cls}" data-filter-target="photos" data-cat="${cat}" style="background:${bg};" onclick="openPhotoLightbox(this)" tabindex="0" role="button" aria-label="${safeCap} — ${safeLoc}" data-bg="${safeBg}" data-caption="${safeCap}" data-loc="${safeLoc}" data-img="${esc(img)}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openPhotoLightbox(this);}">
    ${imgLayer}
    <div class="overlay">
      <div class="ph-title">${esc(caption)}</div>
      <div class="ph-meta">${esc(loc)}</div>
    </div>
    <div class="photo-zoom-hint" aria-hidden="true"><i class="ph-bold ph-arrows-out"></i></div>
  </div>`;
}

function podRow(it) {
  const num = esc(it.num || '');
  const artV = esc(it.artV || '');
  return `<div class="pod-row">
    <div class="pod-art ${artV}">${num}</div>
    <div class="pod-body">
      <div class="ep">${esc(it.ep || '')}</div>
      <h4>${esc(it.title || '')}</h4>
      <p>${esc(it.desc || '')}</p>
      <div class="pod-meta"><span><i class="ph ph-clock"></i> ${esc(it.len || '')}</span><span><i class="ph ph-calendar-blank"></i> ${esc(it.date || '')}</span><span><i class="ph ph-file-text"></i> Transcript</span></div>
    </div>
    <button class="pod-play" aria-label="Play ${esc(it.ep || '')}"><i class="ph-fill ph-play"></i></button>
  </div>`;
}

function videoCard(it) {
  return `<div class="video-card" data-filter-target="videos" data-cat="${esc(it.cat || '')}">
    <div class="video-thumb ${esc(it.bg || 'vid-bg-1')}">
      <div class="vid-inner-label">${esc(it.label || '')}</div>
      <div class="play-btn"><i class="ph-fill ph-play"></i></div>
      <div class="cc">CC</div>
      <div class="dur">${esc(it.dur || '')}</div>
    </div>
    <div class="video-body">
      <h4>${esc(it.title || '')}</h4>
      <p>${esc(it.desc || '')}</p>
      <div class="video-meta"><span>${esc(it.date || '')}</span><span class="sep">·</span><span>${esc(it.views || '')}</span></div>
    </div>
  </div>`;
}

export function renderMedia(content) {
  const m = content?.media || {};
  const photos = visibleSorted(m.photos || []);
  const pods = visibleSorted(m.podcasts || []);
  const vids = visibleSorted(m.videos || []);
  const show = m.podcastShow || {};

  const photoCats = Array.from(new Set(photos.map((p) => p.cat).filter(Boolean)));
  const videoCats = Array.from(new Set(vids.map((v) => v.cat).filter(Boolean)));

  return `
  <div class="page-hero">
    <div class="page-hero-inner">
      <div class="section-eyebrow">${esc(m.heroEyebrow || 'Media')}</div>
      <h1>${rich(m.heroTitle || 'From the field.')}</h1>
      ${m.heroSub ? `<p>${esc(m.heroSub)}</p>` : ''}
    </div>
  </div>

  <nav class="subnav" aria-label="Media sections">
    <div class="subnav-inner">
      <button data-sub="photos" class="active" onclick="activateSub('media','photos')">Photos</button>
      <button data-sub="podcasts" onclick="activateSub('media','podcasts')">Podcasts</button>
      <button data-sub="videos" onclick="activateSub('media','videos')">Videos</button>
    </div>
  </nav>

  <div class="subpage active" data-sub="photos">
    <section class="section">
      <div class="section-inner">
        ${photoCats.length ? `<div class="filter-bar" data-filter-group="photos" onclick="filterPills(this, event.target.dataset.filter || 'all')">
          <div class="filter-label">Filter</div>
          <button class="filter-pill active" data-filter="all">All</button>
          ${photoCats.map((c) => `<button class="filter-pill" data-filter="${esc(c)}">${esc(c.charAt(0).toUpperCase() + c.slice(1))}</button>`).join('')}
        </div>` : ''}

        <div class="photo-grid">
          ${photos.map(photoTile).join('') || '<p style="grid-column:1/-1;color:var(--fg-muted);">No photos yet.</p>'}
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="section-inner" style="text-align:center;">
        <div style="font-family:var(--font-display);font-size:.72rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--brand);margin-bottom:10px;">Photo Accessibility</div>
        <h2 style="font-family:var(--font-display);font-size:1.6rem;font-weight:700;color:var(--fg);margin-bottom:10px;letter-spacing:-.02em;">Every image is described.</h2>
        <p style="color:var(--fg-muted);max-width:600px;margin:0 auto;line-height:1.65;">All our photos include full alt text in 40+ languages. Audio descriptions are available for every photo essay.</p>
      </div>
    </section>
  </div>

  <div class="subpage" data-sub="podcasts">
    <section class="section">
      <div class="section-inner">
        <div class="pod-featured">
          <div>
            <div style="font-family:var(--font-display);font-size:.72rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:12px;">Featured Podcast</div>
            <h3 style="font-family:var(--font-display);font-size:1.75rem;font-weight:700;color:var(--fg);margin-bottom:12px;letter-spacing:-.025em;line-height:1.15;">${esc(show.name || 'Our podcast')}</h3>
            <p style="color:var(--fg-muted);margin-bottom:20px;line-height:1.65;">${esc(show.desc || '')}</p>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button class="btn-primary"><i class="ph-fill ph-play"></i> Play Latest</button>
              <button class="btn-secondary"><i class="ph ph-rss-simple"></i> Subscribe</button>
            </div>
          </div>
          <div style="aspect-ratio:1;border-radius:var(--radius-lg);background:linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;">
            <div style="color:#fff;text-align:center;z-index:1;font-family:var(--font-display);">
              <div style="font-size:2.5rem;font-weight:700;letter-spacing:-.03em;line-height:1;">${esc(show.name || 'Podcast')}</div>
              <div style="font-size:.75rem;margin-top:14px;letter-spacing:.12em;opacity:.85;">PODCAST · ${pods.length} EPISODES LISTED</div>
            </div>
          </div>
        </div>

        <h3 style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:var(--fg);margin-bottom:18px;">Recent episodes</h3>
        <div class="pod-list">
          ${pods.map(podRow).join('') || '<p style="color:var(--fg-muted);">No episodes yet.</p>'}
        </div>
      </div>
    </section>
  </div>

  <div class="subpage" data-sub="videos">
    <section class="section">
      <div class="section-inner">
        ${videoCats.length ? `<div class="filter-bar" data-filter-group="videos" onclick="filterPills(this, event.target.dataset.filter || 'all')">
          <div class="filter-label">Category</div>
          <button class="filter-pill active" data-filter="all">All</button>
          ${videoCats.map((c) => `<button class="filter-pill" data-filter="${esc(c)}">${esc(c.charAt(0).toUpperCase() + c.slice(1))}</button>`).join('')}
        </div>` : ''}

        <div class="video-grid">
          ${vids.map(videoCard).join('') || '<p style="grid-column:1/-1;color:var(--fg-muted);">No videos yet.</p>'}
        </div>
      </div>
    </section>
  </div>

  <div class="photo-lightbox" id="photoLightbox" role="dialog" aria-modal="true" aria-hidden="true" aria-label="Photo viewer" onclick="if(event.target===this)closePhotoLightbox()">
    <button class="lb-close" type="button" aria-label="Close photo" onclick="closePhotoLightbox()"><i class="ph-bold ph-x"></i></button>
    <button class="lb-nav lb-prev" type="button" aria-label="Previous photo" onclick="navLightbox(-1)"><i class="ph-bold ph-caret-left"></i></button>
    <button class="lb-nav lb-next" type="button" aria-label="Next photo" onclick="navLightbox(1)"><i class="ph-bold ph-caret-right"></i></button>
    <figure class="lb-stage">
      <div class="lb-image" id="lbImage">
        <div class="lb-placeholder"><i class="ph ph-image-square"></i></div>
      </div>
      <figcaption class="lb-caption">
        <div class="lb-meta">
          <span class="lb-loc" id="lbLoc"></span>
          <span class="lb-count" id="lbCount"></span>
        </div>
        <div class="lb-title" id="lbTitle"></div>
      </figcaption>
    </figure>
  </div>`;
}
