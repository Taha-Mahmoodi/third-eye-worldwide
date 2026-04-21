function renderMedia() {
  return `
  <div class="page-hero">
    <div class="page-hero-inner">
      <div class="section-eyebrow">Media</div>
      <h1>From the <em>field.</em></h1>
      <p>Photos, podcasts, and videos from our community — every video captioned, every podcast transcribed, every photo described.</p>
    </div>
  </div>

  <nav class="subnav" aria-label="Media sections">
    <div class="subnav-inner">
      <button data-sub="photos" class="active" onclick="activateSub('media','photos')">Photos</button>
      <button data-sub="podcasts" onclick="activateSub('media','podcasts')">Podcasts</button>
      <button data-sub="videos" onclick="activateSub('media','videos')">Videos</button>
    </div>
  </nav>

  <!-- PHOTOS -->
  <div class="subpage active" data-sub="photos">
    <section class="section">
      <div class="section-inner">
        <div class="filter-bar" data-filter-group="photos" onclick="filterPills(this, event.target.dataset.filter || 'all')">
          <div class="filter-label">Filter</div>
          <button class="filter-pill active" data-filter="all">All</button>
          <button class="filter-pill" data-filter="field">Field work</button>
          <button class="filter-pill" data-filter="training">Training</button>
          <button class="filter-pill" data-filter="events">Events</button>
          <button class="filter-pill" data-filter="team">Team</button>
        </div>

        <div class="photo-grid">
          ${photo('p-6-4', 'field', 'Nairobi, Kenya', 'A matatu driver and a TEWW user test the new Navigation Aid', ['#1f61ff','#1349d4'])}
          ${photo('p-3-2', 'training', 'Mumbai, India', 'Week-one cohort introductions', ['#e76021','#f07a3d'])}
          ${photo('p-3-2', 'events', 'São Paulo, Brazil', 'Annual community assembly', ['#0d0407','#4a4a6a'])}
          ${photo('p-4-2', 'team', 'Accra, Ghana', 'Our West Africa office opens', ['#1349d4','#4d7eff'])}
          ${photo('p-4-2', 'field', 'Dhaka, Bangladesh', 'Device distribution, flood recovery', ['#c04c18','#e76021'])}
          ${photo('p-4-4', 'training', 'Cairo, Egypt', 'Code academy graduation day', ['#eef3ff','#d6e4ff'])}
          ${photo('p-4-2', 'events', 'Jakarta, Indonesia', 'Advocacy summit 2025', ['#1f61ff','#4d7eff'])}
          ${photo('p-4-2', 'field', 'La Paz, Bolivia', 'Mountain village screenings', ['#333350','#0d0407'])}
          ${photo('p-6-2', 'team', 'Virtual', 'All-hands meeting, 120 staff in 47 countries', ['#e76021','#c04c18'])}
          ${photo('p-6-2', 'training', 'Manila, Philippines', 'Instructor-led sessions in a public library', ['#7a9fff','#1f61ff'])}
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="section-inner" style="text-align:center;">
        <div style="font-family:var(--font-display);font-size:.72rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--brand);margin-bottom:10px;">Photo Accessibility</div>
        <h2 style="font-family:var(--font-display);font-size:1.6rem;font-weight:700;color:var(--fg);margin-bottom:10px;letter-spacing:-.02em;">Every image is described.</h2>
        <p style="color:var(--fg-muted);max-width:600px;margin:0 auto;line-height:1.65;">All our photos include full alt text in 40+ languages. Audio descriptions are available for every photo essay. Download packs with ALT text manifests included.</p>
      </div>
    </section>
  </div>

  <!-- PODCASTS -->
  <div class="subpage" data-sub="podcasts">
    <section class="section">
      <div class="section-inner">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;margin-bottom:56px;padding:32px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-xl);box-shadow:var(--shadow-md);">
          <div>
            <div style="font-family:var(--font-display);font-size:.72rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:12px;">Featured Podcast</div>
            <h3 style="font-family:var(--font-display);font-size:1.75rem;font-weight:700;color:var(--fg);margin-bottom:12px;letter-spacing:-.025em;line-height:1.15;">The Third Eye</h3>
            <p style="color:var(--fg-muted);margin-bottom:20px;line-height:1.65;">Weekly conversations with visually impaired builders, designers, educators, and policymakers around the world. Hosted by Maya Osei. 142 episodes. Transcripts for every episode.</p>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button class="btn-primary"><i class="ph-fill ph-play"></i> Play Latest</button>
              <button class="btn-secondary"><i class="ph ph-rss-simple"></i> Subscribe</button>
            </div>
            <div style="display:flex;gap:18px;margin-top:20px;flex-wrap:wrap;">
              <a href="#" style="font-family:var(--font-display);font-size:.85rem;color:var(--fg-muted);display:inline-flex;align-items:center;gap:5px;"><i class="ph ph-spotify-logo"></i> Spotify</a>
              <a href="#" style="font-family:var(--font-display);font-size:.85rem;color:var(--fg-muted);display:inline-flex;align-items:center;gap:5px;"><i class="ph ph-apple-podcasts-logo"></i> Apple</a>
              <a href="#" style="font-family:var(--font-display);font-size:.85rem;color:var(--fg-muted);display:inline-flex;align-items:center;gap:5px;"><i class="ph ph-youtube-logo"></i> YouTube</a>
              <a href="#" style="font-family:var(--font-display);font-size:.85rem;color:var(--fg-muted);display:inline-flex;align-items:center;gap:5px;"><i class="ph ph-rss-simple"></i> RSS</a>
            </div>
          </div>
          <div style="aspect-ratio:1;border-radius:var(--radius-lg);background:linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;">
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:.15;">
              <svg width="80%" viewBox="0 0 220 257.57"><path fill="#fff" d="M212.24,8.45c-5.74-5.63-13.38-8.45-22.94-8.45H0v57.17c13.39-5.17,28.43-8.08,44.32-8.08,32.4,0,61.24,12.06,79.89,30.85,3.56,3.59,3.56,9.32,0,12.9-18.65,18.79-47.49,30.86-79.89,30.86-5.32,0-10.54-.33-15.64-.96-10.14-1.24-19.77-3.69-28.68-7.13v108.45c0,9.77,2.86,17.47,8.6,23.11,5.74,5.63,13.38,8.45,22.94,8.45h189.29v-57.17c-13.4,5.17-28.43,8.08-44.32,8.08-32.4,0-61.25-12.06-79.89-30.85-3.56-3.59-3.56-9.32,0-12.9,18.64-18.79,47.49-30.86,79.89-30.86,5.32,0,10.54.33,15.64.96,10.13,1.24,19.76,3.69,28.68,7.13V31.55c0-9.77-2.86-17.48-8.6-23.11Z"/></svg>
            </div>
            <div style="color:#fff;text-align:center;z-index:1;font-family:var(--font-display);">
              <div style="font-size:2.5rem;font-weight:700;letter-spacing:-.03em;line-height:1;">The Third<br>Eye</div>
              <div style="font-size:.75rem;margin-top:14px;letter-spacing:.12em;opacity:.85;">PODCAST · EPISODES 1–142</div>
            </div>
          </div>
        </div>

        <h3 style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:var(--fg);margin-bottom:18px;">Recent episodes</h3>
        <div class="pod-list">
          ${pod('142','','Ep 142','Kofi on building an accessibility company from Accra','From Screen Reader user to CTO — a 5-year journey.','52 min','Released Apr 18')}
          ${pod('141','v2','Ep 141','Why WCAG alone is not enough, with Dr. Rhea Nair','Our head of research on field-testing methodology.','38 min','Released Apr 11')}
          ${pod('140','v3','Ep 140','Navigating Nairobi — Miriam Waithera','A matatu ride with the TEWW Navigation Aid.','44 min','Released Apr 4')}
          ${pod('139','v4','Ep 139','The global braille renaissance','With Tomás Luján, VP of Engineering.','61 min','Released Mar 28')}
          ${pod('138','v5','Ep 138','Inside a Device Lending Library in Dhaka','A day of deliveries with field officer Rahim.','35 min','Released Mar 21')}
          ${pod('137','','Ep 137','Civic tech that works for everyone','On accessible ballots in three countries.','49 min','Released Mar 14')}
        </div>
      </div>
    </section>
  </div>

  <!-- VIDEOS -->
  <div class="subpage" data-sub="videos">
    <section class="section">
      <div class="section-inner">
        <div class="filter-bar" data-filter-group="videos" onclick="filterPills(this, event.target.dataset.filter || 'all')">
          <div class="filter-label">Category</div>
          <button class="filter-pill active" data-filter="all">All</button>
          <button class="filter-pill" data-filter="stories">User stories</button>
          <button class="filter-pill" data-filter="tutorials">Tutorials</button>
          <button class="filter-pill" data-filter="behind">Behind the scenes</button>
          <button class="filter-pill" data-filter="events">Events</button>
        </div>

        <div class="video-grid">
          ${video('vid-bg-1','FEATURE','4:12','A day in the life — Amara, Lagos','stories','Follow Amara from morning commute to job interview using only TEWW tools.','Apr 12, 2026','8.2K views')}
          ${video('vid-bg-2','TUTORIAL','6:45','Getting started with Screen Reader','tutorials','Installation, first-run setup, and the 10 keyboard shortcuts you need first.','Apr 5, 2026','14K views')}
          ${video('vid-bg-3','STORY','3:58','Kofi: From student to CTO','stories','Five years. One screen reader. A software company in Accra.','Mar 28, 2026','22K views')}
          ${video('vid-bg-4','BEHIND','5:20','Inside our Nairobi office','behind','Meet Juma Kimani and the East Africa team.','Mar 19, 2026','5.1K views')}
          ${video('vid-bg-5','TUTORIAL','8:14','Visual Magnifier deep-dive','tutorials','Every setting, every gesture, every use case.','Mar 12, 2026','11K views')}
          ${video('vid-bg-6','EVENT','12:03','Access Summit 2026 keynote','events','Arjun Rao on the next decade of assistive technology.','Feb 28, 2026','31K views')}
        </div>

        <div style="margin-top:48px;padding:24px;background:var(--bg-subtle);border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:14px;">
            <i class="ph-fill ph-closed-captioning" style="font-size:28px;color:var(--brand);"></i>
            <div>
              <div style="font-family:var(--font-display);font-weight:700;color:var(--fg);font-size:.95rem;">Every video is captioned. Every script is published.</div>
              <div style="font-size:.85rem;color:var(--fg-muted);margin-top:3px;">Captions in 40+ languages. Audio description tracks available for all story and event videos.</div>
            </div>
          </div>
          <button class="btn-secondary" style="font-size:.88rem;padding:10px 20px;">Download transcripts</button>
        </div>
      </div>
    </section>
  </div>

  <!-- LIGHTBOX -->
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

// ── Lightbox styles + handlers (runs at file load) ──
(function() {
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
      .filter(el => el.offsetParent !== null);
  }
  function renderLightbox() {
    const tile = tiles[currentIdx];
    if (!tile) return;
    const img = document.getElementById('lbImage');
    img.style.background = tile.dataset.bg || tile.style.background;
    document.getElementById('lbTitle').textContent = tile.dataset.caption || '';
    document.getElementById('lbLoc').textContent = tile.dataset.loc || '';
    document.getElementById('lbCount').textContent = '· ' + (currentIdx + 1) + ' / ' + tiles.length;
  }
  function lbKey(e) {
    if (e.key === 'Escape') window.closePhotoLightbox();
    else if (e.key === 'ArrowLeft') window.navLightbox(-1);
    else if (e.key === 'ArrowRight') window.navLightbox(1);
  }
  window.openPhotoLightbox = function(tile) {
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
  window.closePhotoLightbox = function() {
    const lb = document.getElementById('photoLightbox');
    if (!lb) return;
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', lbKey);
  };
  window.navLightbox = function(dir) {
    if (!tiles.length) return;
    currentIdx = (currentIdx + dir + tiles.length) % tiles.length;
    renderLightbox();
  };
})();

/* ── ORPHAN_REMOVED_START ──
    .photo-tile { cursor: pointer; transition: transform .25s ease, box-shadow .25s ease; }
    .photo-tile:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,0,0,.18); }
    .photo-tile:focus-visible { outline: 3px solid var(--brand); outline-offset: 4px; }
    .photo-zoom-hint {
      position: absolute; top: 14px; right: 14px;
      width: 34px; height: 34px; border-radius: 50%;
      background: rgba(0,0,0,.55); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; opacity: 0; transform: scale(.85);
      transition: opacity .2s, transform .2s;
      backdrop-filter: blur(6px);
    }
    .photo-tile:hover .photo-zoom-hint,
    .photo-tile:focus-visible .photo-zoom-hint { opacity: 1; transform: scale(1); }

    .photo-lightbox {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(8, 8, 14, .94);
      display: none;
      align-items: center; justify-content: center;
      padding: 40px 80px;
      backdrop-filter: blur(8px);
      animation: lbFade .2s ease;
    }
    .photo-lightbox.open { display: flex; }
    @keyframes lbFade { from { opacity: 0; } to { opacity: 1; } }

    .lb-stage {
      max-width: min(1200px, 95vw);
      width: 100%;
      display: flex; flex-direction: column;
      gap: 18px;
      animation: lbScale .25s ease;
    }
    @keyframes lbScale { from { transform: scale(.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    .lb-image {
      width: 100%;
      aspect-ratio: 16 / 10;
      max-height: 78vh;
      border-radius: var(--radius-xl, 16px);
      overflow: hidden;
      position: relative;
      box-shadow: 0 40px 80px rgba(0,0,0,.5);
      background: #1a1a24;
    }
    .lb-placeholder {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 120px;
      color: rgba(255,255,255,.18);
    }

    .lb-caption {
      color: #fff;
      display: flex; flex-direction: column; gap: 6px;
      padding: 0 4px;
    }
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
      font-weight: 600;
      letter-spacing: -.02em;
      line-height: 1.3;
      color: #fff;
      max-width: 80ch;
    }

    .lb-close, .lb-nav {
      position: absolute;
      border: 1px solid rgba(255,255,255,.15);
      background: rgba(255,255,255,.08);
      color: #fff;
      width: 48px; height: 48px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      font-size: 18px;
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
  </style>

  <script>
    (function(){
      if (window.__photoLightboxWired) return;
      window.__photoLightboxWired = true;

      let currentIdx = -1;
      let tiles = [];

      function visibleTiles() {
        return Array.from(document.querySelectorAll('.photo-tile'))
          .filter(el => el.offsetParent !== null);
      }

      window.openPhotoLightbox = function(tile) {
        tiles = visibleTiles();
        currentIdx = tiles.indexOf(tile);
        if (currentIdx < 0) currentIdx = 0;
        renderLightbox();
        const lb = document.getElementById('photoLightbox');
        lb.classList.add('open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', lbKey);
      };

      window.closePhotoLightbox = function() {
        const lb = document.getElementById('photoLightbox');
        lb.classList.remove('open');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', lbKey);
      };

      window.navLightbox = function(dir) {
        if (!tiles.length) return;
        currentIdx = (currentIdx + dir + tiles.length) % tiles.length;
        renderLightbox();
      };

      function renderLightbox() {
        const tile = tiles[currentIdx];
        if (!tile) return;
        const img = document.getElementById('lbImage');
        img.style.background = tile.dataset.bg || tile.style.background;
        document.getElementById('lbTitle').textContent = tile.dataset.caption || '';
        document.getElementById('lbLoc').textContent = tile.dataset.loc || '';
        document.getElementById('lbCount').textContent = \`· \${currentIdx + 1} / \${tiles.length}\`;
      }

      function lbKey(e) {
        if (e.key === 'Escape') closePhotoLightbox();
        else if (e.key === 'ArrowLeft') navLightbox(-1);
        else if (e.key === 'ArrowRight') navLightbox(1);
      }
    })();
  </script>`;
}
── ORPHAN_REMOVED_END ── */

function photo(cls, cat, loc, caption, grad) {
  const bg = `linear-gradient(135deg, ${grad[0]} 0%, ${grad[1]} 100%)`;
  const safeBg = bg.replace(/"/g, '&quot;');
  const safeCap = caption.replace(/"/g, '&quot;');
  const safeLoc = loc.replace(/"/g, '&quot;');
  return `<div class="photo-tile ${cls}" data-filter-target="photos" data-cat="${cat}" style="background:${bg};" onclick="openPhotoLightbox(this)" tabindex="0" role="button" aria-label="${safeCap} — ${safeLoc}" data-bg="${safeBg}" data-caption="${safeCap}" data-loc="${safeLoc}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openPhotoLightbox(this);}">
    <div class="ph-placeholder"><i class="ph ph-image-square"></i></div>
    <div class="overlay">
      <div class="ph-title">${caption}</div>
      <div class="ph-meta">${loc}</div>
    </div>
    <div class="photo-zoom-hint" aria-hidden="true"><i class="ph-bold ph-arrows-out"></i></div>
  </div>`;
}
function pod(num, artV, ep, title, desc, len, date) {
  return `<div class="pod-row">
    <div class="pod-art ${artV}">${num}</div>
    <div class="pod-body">
      <div class="ep">${ep}</div>
      <h4>${title}</h4>
      <p>${desc}</p>
      <div class="pod-meta"><span><i class="ph ph-clock"></i> ${len}</span><span><i class="ph ph-calendar-blank"></i> ${date}</span><span><i class="ph ph-file-text"></i> Transcript</span></div>
    </div>
    <button class="pod-play" aria-label="Play ${ep}"><i class="ph-fill ph-play"></i></button>
  </div>`;
}
function video(bg, label, dur, title, cat, desc, date, views) {
  return `<div class="video-card" data-filter-target="videos" data-cat="${cat}">
    <div class="video-thumb ${bg}">
      <div class="vid-inner-label">${label}</div>
      <div class="play-btn"><i class="ph-fill ph-play"></i></div>
      <div class="cc">CC</div>
      <div class="dur">${dur}</div>
    </div>
    <div class="video-body">
      <h4>${title}</h4>
      <p>${desc}</p>
      <div class="video-meta"><span>${date}</span><span class="sep">·</span><span>${views}</span></div>
    </div>
  </div>`;
}
