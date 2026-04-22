// Client-only one-time setup: lightbox, scrollspy for article TOC, reader progress bar.
// Imported dynamically from components/ClientBootstrap.js so it runs only in the browser.

// ── Photo lightbox (media route) ──
(function () {
  if (typeof window === 'undefined') return;
  if (window.__photoLightboxWired) return;
  window.__photoLightboxWired = true;

  const css = `
    .photo-tile { cursor: pointer; transition: transform .25s ease, box-shadow .25s ease; }
    .photo-tile:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,0,0,.18); }
    .photo-tile:focus-visible { outline: 3px solid var(--brand); outline-offset: 4px; }
    .photo-zoom-hint {
      position: absolute; top: 14px; right: 14px;
      width: 34px; height: 34px; border-radius: 50%;
      background: rgba(0,0,0,.55); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; opacity: 0; transform: scale(.85);
      transition: opacity .2s, transform .2s; backdrop-filter: blur(6px);
    }
    .photo-tile:hover .photo-zoom-hint,
    .photo-tile:focus-visible .photo-zoom-hint { opacity: 1; transform: scale(1); }
    .photo-lightbox {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(8, 8, 14, .94);
      display: none;
      align-items: center; justify-content: center;
      padding: 40px 80px; backdrop-filter: blur(8px);
      animation: lbFade .2s ease;
    }
    .photo-lightbox.open { display: flex; }
    @keyframes lbFade { from { opacity: 0; } to { opacity: 1; } }
    .lb-stage {
      max-width: min(1200px, 95vw); width: 100%;
      display: flex; flex-direction: column; gap: 18px;
      animation: lbScale .25s ease;
    }
    @keyframes lbScale { from { transform: scale(.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .lb-image {
      width: 100%; aspect-ratio: 16 / 10; max-height: 78vh;
      border-radius: var(--radius-xl, 16px); overflow: hidden;
      position: relative; box-shadow: 0 40px 80px rgba(0,0,0,.5);
      background: #1a1a24;
    }
    .lb-placeholder {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 120px; color: rgba(255,255,255,.18);
    }
    .lb-caption { color: #fff; display: flex; flex-direction: column; gap: 6px; padding: 0 4px; }
    .lb-meta {
      display: flex; align-items: center; gap: 12px;
      font-family: var(--font-display, sans-serif);
      font-size: .74rem; font-weight: 700;
      letter-spacing: .16em; text-transform: uppercase;
      color: rgba(255,255,255,.6);
    }
    .lb-loc { color: var(--accent, #e76021); }
    .lb-count { color: rgba(255,255,255,.45); }
    .lb-title {
      font-family: var(--font-display, sans-serif);
      font-size: clamp(1.15rem, 2vw, 1.5rem);
      font-weight: 600; letter-spacing: -.02em; line-height: 1.3;
      color: #fff; max-width: 80ch;
    }
    .lb-close, .lb-nav {
      position: absolute;
      border: 1px solid rgba(255,255,255,.15);
      background: rgba(255,255,255,.08); color: #fff;
      width: 48px; height: 48px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 18px;
      transition: background .2s, transform .2s, border-color .2s;
      backdrop-filter: blur(8px);
    }
    .lb-close:hover, .lb-nav:hover { background: rgba(255,255,255,.18); border-color: rgba(255,255,255,.3); }
    .lb-close:active, .lb-nav:active { transform: scale(.94); }
    .lb-close { top: 22px; right: 26px; }
    .lb-prev { left: 22px; top: 50%; transform: translateY(-50%); }
    .lb-next { right: 22px; top: 50%; transform: translateY(-50%); }
    .lb-prev:active { transform: translateY(-50%) scale(.94); }
    .lb-next:active { transform: translateY(-50%) scale(.94); }
    @media (max-width: 720px) {
      .photo-lightbox { padding: 16px; }
      .lb-close { top: 12px; right: 12px; }
      .lb-prev { left: 8px; }
      .lb-next { right: 8px; }
      .lb-image { aspect-ratio: 4 / 5; max-height: 70vh; }
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  let currentIdx = -1;
  let tiles = [];

  function visibleTiles() {
    return Array.from(document.querySelectorAll('.photo-tile'))
      .filter((el) => el.offsetParent !== null);
  }
  function renderLightbox() {
    const tile = tiles[currentIdx];
    if (!tile) return;
    const img = document.getElementById('lbImage');
    if (!img) return;
    img.style.background = tile.dataset.bg || tile.style.background;
    const t = document.getElementById('lbTitle');
    const l = document.getElementById('lbLoc');
    const c = document.getElementById('lbCount');
    if (t) t.textContent = tile.dataset.caption || '';
    if (l) l.textContent = tile.dataset.loc || '';
    if (c) c.textContent = '· ' + (currentIdx + 1) + ' / ' + tiles.length;
  }
  function lbKey(e) {
    if (e.key === 'Escape') window.closePhotoLightbox();
    else if (e.key === 'ArrowLeft') window.navLightbox(-1);
    else if (e.key === 'ArrowRight') window.navLightbox(1);
  }
  window.openPhotoLightbox = function (tile) {
    tiles = visibleTiles();
    currentIdx = tiles.indexOf(tile);
    if (currentIdx < 0) currentIdx = 0;
    renderLightbox();
    const lb = document.getElementById('photoLightbox');
    if (!lb) return;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', lbKey);
  };
  window.closePhotoLightbox = function () {
    const lb = document.getElementById('photoLightbox');
    if (!lb) return;
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', lbKey);
  };
  window.navLightbox = function (dir) {
    if (!tiles.length) return;
    currentIdx = (currentIdx + dir + tiles.length) % tiles.length;
    renderLightbox();
  };
})();

// ── Article TOC scrollspy (blog-detail route) ──
(function () {
  if (typeof window === 'undefined') return;
  if (window.__articleTocWired) return;
  window.__articleTocWired = true;

  function updateActive() {
    const toc = document.querySelector('.article-toc');
    if (!toc) return;
    const links = toc.querySelectorAll('a[href^="#"]');
    if (!links.length) return;
    const y = window.scrollY + 140;
    let activeId = null;
    links.forEach((a) => {
      const id = a.getAttribute('href').slice(1);
      const t = document.getElementById(id);
      if (!t) return;
      if (t.offsetTop <= y) activeId = id;
    });
    links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + activeId));
  }
  let rafPending = false;
  window.addEventListener('scroll', () => {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => { rafPending = false; updateActive(); });
  });
})();

// ── Reader progress bar (story-detail route) ──
(function () {
  if (typeof window === 'undefined') return;
  if (window.__storyProgressWired) return;
  window.__storyProgressWired = true;

  function tick() {
    const bar = document.querySelector('#storyProgress .bar');
    if (!bar) return;
    const body = document.querySelector('.story-body');
    if (!body) { bar.style.width = '0%'; return; }
    const rect = body.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const total = rect.height - window.innerHeight + 200;
    const progressed = window.scrollY - top + 120;
    const pct = Math.max(0, Math.min(100, (progressed / Math.max(1, total)) * 100));
    bar.style.width = pct.toFixed(1) + '%';
  }
  let raf = false;
  window.addEventListener('scroll', () => {
    if (raf) return;
    raf = true;
    requestAnimationFrame(() => { raf = false; tick(); });
  });
})();
