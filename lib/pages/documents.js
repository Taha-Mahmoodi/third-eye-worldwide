import { visibleSorted } from '@/lib/cms/db';

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}
function rich(s) { return s == null ? '' : String(s); }

function docCard(it, defaultKind = 'blog') {
  const kind = it.tagClass === 'story' ? 'story' : 'blog';
  const target = kind === 'story' ? 'story-detail' : 'blog-detail';
  const extra = esc(it.extra || '');
  const hero = esc(it.heroType || (kind === 'story' ? 'type-story' : 'type-blog'));
  const tagClass = esc(it.tagClass || defaultKind);
  const tagLabel = esc(it.tagLabel || (defaultKind === 'story' ? 'Story' : 'Blog'));
  const cat = esc(it.cat || '');
  const title = esc(it.title || '');
  const desc = esc(it.desc || '');
  const author = esc(it.author || '');
  const initials = esc(it.initials || 'TE');
  const meta = esc(it.meta || it.readTime || '');
  const group = defaultKind === 'story' ? 'stories' : 'blogs';

  return `<div class="doc-card ${extra}" data-filter-target="${group}" data-cat="${cat}" role="link" tabindex="0" aria-label="Read: ${title}" onclick="goto('${target}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();goto('${target}');}" style="cursor:pointer;">
    <div class="doc-hero ${hero}">
      <div>
        <span class="cat-tag ${tagClass}">${tagLabel}</span>
        <h3>${title}</h3>
      </div>
    </div>
    <div class="doc-body">
      <p>${desc}</p>
      <div class="doc-meta">
        <div class="doc-author"><div class="avatar">${initials}</div><span>${author}</span></div>
        <span class="sep">·</span><span>${meta}</span>
      </div>
    </div>
  </div>`;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function renderDocuments(content) {
  const d = content?.documents || {};
  const blogs = visibleSorted(d.blogs || []);
  const stories = visibleSorted(d.stories || []);
  const fs = d.featuredStory || {};

  // Build filter pills from unique blog categories.
  const cats = Array.from(new Set(blogs.map((b) => b.cat).filter(Boolean)));

  const blogRows = chunk(blogs, 3)
    .map((row, i) => `<div class="doc-grid"${i > 0 ? ' style="margin-top:24px;"' : ''}>${row.map((b) => docCard(b, 'blog')).join('')}</div>`)
    .join('');

  const storyRows = chunk(stories, 3)
    .map((row, i) => `<div class="doc-grid"${i > 0 ? ' style="margin-top:24px;"' : ''}>${row.map((s) => docCard(s, 'story')).join('')}</div>`)
    .join('');

  return `
  <div class="page-hero">
    <div class="page-hero-inner">
      <div class="section-eyebrow">${esc(d.heroEyebrow || 'Documents')}</div>
      <h1>${rich(d.heroTitle || 'Read deeper.')}</h1>
      ${d.heroSub ? `<p>${esc(d.heroSub)}</p>` : ''}
    </div>
  </div>

  <nav class="subnav" aria-label="Documents sections">
    <div class="subnav-inner">
      <button data-sub="blogs" class="active" onclick="activateSub('documents','blogs')">Blogs</button>
      <button data-sub="stories" onclick="activateSub('documents','stories')">Stories</button>
    </div>
  </nav>

  <div class="subpage active" data-sub="blogs">
    <section class="section">
      <div class="section-inner">
        ${cats.length ? `<div class="filter-bar" data-filter-group="blogs" onclick="filterPills(this, event.target.dataset.filter || 'all')">
          <div class="filter-label">Topic</div>
          <button class="filter-pill active" data-filter="all">All</button>
          ${cats.map((c) => `<button class="filter-pill" data-filter="${esc(c)}">${esc(c.charAt(0).toUpperCase() + c.slice(1))}</button>`).join('')}
        </div>` : ''}

        ${blogRows || '<p style="color:var(--fg-muted);">No posts yet.</p>'}

        ${blogs.length > 9 ? `<div style="display:flex;justify-content:center;margin-top:48px;">
          <button class="btn-secondary">Load more posts</button>
        </div>` : ''}
      </div>
    </section>

    <section class="section section-alt">
      <div class="section-inner">
        <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:48px;align-items:center;padding:40px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-xl);box-shadow:var(--shadow-md);">
          <div>
            <div class="section-eyebrow" style="margin-bottom:10px;">Newsletter</div>
            <h2 style="font-family:var(--font-display);font-size:1.75rem;font-weight:700;color:var(--fg);margin-bottom:12px;letter-spacing:-.02em;line-height:1.15;">Twice a month. No spam.</h2>
            <p style="color:var(--fg-muted);line-height:1.65;">Research summaries, new tools, and stories from the field — delivered in plain text, screen-reader-optimised, with a one-click unsubscribe.</p>
          </div>
          <form style="display:flex;flex-direction:column;gap:12px;" onsubmit="event.preventDefault();this.querySelector('button').innerHTML = '<i class=\\'ph ph-check\\'></i> Subscribed';">
            <input type="email" placeholder="you@example.com" required style="font-family:var(--font-body);font-size:1rem;color:var(--fg);background:var(--bg);border:1.5px solid var(--border);border-radius:var(--radius-md);padding:14px 18px;outline:none;">
            <button type="submit" class="btn-primary" style="justify-content:center;"><i class="ph ph-paper-plane-tilt"></i> Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  </div>

  <div class="subpage" data-sub="stories">
    <section class="section">
      <div class="section-inner">
        <div class="section-heading left" style="max-width:720px;margin-bottom:32px;">
          <div class="section-eyebrow">Stories</div>
          <h2 class="section-title">Voices from our community</h2>
          <p class="section-subtitle">Real people, real independence. These are the stories that remind us why the work matters.</p>
        </div>

        ${fs.title ? `<article style="display:grid;grid-template-columns:1.2fr 1fr;gap:40px;margin-bottom:56px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-xl);overflow:hidden;box-shadow:var(--shadow-md);">
          <div style="aspect-ratio:4/5;background:linear-gradient(135deg, var(--accent) 0%, #c04c18 100%);display:flex;align-items:flex-end;padding:40px;color:#fff;position:relative;overflow:hidden;">
            <div style="position:relative;z-index:1;">
              <div style="font-family:var(--font-display);font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.85;margin-bottom:10px;">${esc(fs.eyebrow || 'Featured Story')}</div>
              <div style="font-family:var(--font-display);font-size:4rem;font-weight:700;line-height:.95;letter-spacing:-.04em;">"</div>
              <div style="font-family:var(--font-display);font-size:1.6rem;font-weight:500;line-height:1.25;letter-spacing:-.015em;margin-top:-20px;">${esc(fs.pullQuote || '')}</div>
            </div>
            <div style="position:absolute;bottom:-60px;right:-60px;width:280px;height:280px;border-radius:50%;background:rgba(255,255,255,.08);"></div>
          </div>
          <div style="padding:40px;display:flex;flex-direction:column;justify-content:center;">
            <h3 style="font-family:var(--font-display);font-size:1.75rem;font-weight:700;color:var(--fg);margin-bottom:16px;letter-spacing:-.02em;line-height:1.2;">${esc(fs.title)}</h3>
            <p style="color:var(--fg-muted);line-height:1.7;margin-bottom:20px;">${esc(fs.desc || '')}</p>
            <div style="display:flex;align-items:center;gap:12px;padding-top:20px;border-top:1px solid var(--border);">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#4d7eff,#1f61ff);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:.85rem;">${esc(fs.initials || 'TE')}</div>
              <div>
                <div style="font-family:var(--font-display);font-weight:600;font-size:.92rem;color:var(--fg);">${esc(fs.author || '')}</div>
                <div style="font-size:.8rem;color:var(--fg-muted);">${esc(fs.authorRole || '')}</div>
              </div>
              <button class="btn-primary" style="margin-left:auto;font-size:.88rem;padding:10px 20px;" onclick="goto('story-detail')">Read <i class="ph ph-arrow-right"></i></button>
            </div>
          </div>
        </article>` : ''}

        <h3 style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:var(--fg);margin-bottom:18px;">More stories</h3>
        ${storyRows || '<p style="color:var(--fg-muted);">No stories yet.</p>'}

        ${stories.length > 6 ? `<div style="display:flex;justify-content:center;margin-top:48px;">
          <button class="btn-secondary">Load more stories</button>
        </div>` : ''}
      </div>
    </section>
  </div>`;
}
