/* ── TEWW CMS DASHBOARD ─────────────────────────
 * Client-side CMS backed by localStorage.
 * Loads cms-data.json (canonical source) as defaults,
 * persists edits to localStorage, and exports/publishes
 * the full data object as JSON.
 */

const CMS = (function () {
  const STORAGE_KEY = 'teww-cms-data';
  const HISTORY_KEY = 'teww-cms-history';
  const HISTORY_LIMIT = 30;

  let state = { data: null, section: 'dashboard', editing: null, search: '', history: [], histIdx: -1, dirty: false };

  const iconList = [
    'ph-speaker-high','ph-magnifying-glass','ph-map-pin','ph-chalkboard-teacher','ph-device-mobile',
    'ph-code','ph-book-open','ph-graduation-cap','ph-briefcase','ph-eye','ph-buildings','ph-translate',
    'ph-hand-heart','ph-users-three','ph-globe-hemisphere-east','ph-scales','ph-heart','ph-microphone',
    'ph-camera','ph-pencil-line','ph-house','ph-house-line','ph-stack','ph-article','ph-squares-four',
    'ph-gear','ph-image','ph-play-circle','ph-chat-circle-dots','ph-calendar-plus','ph-paper-plane-tilt',
    'ph-check','ph-check-circle','ph-arrow-right','ph-arrow-left','ph-arrow-up-right','ph-caret-left',
    'ph-caret-right','ph-plus','ph-x','ph-trash','ph-pencil-simple','ph-copy','ph-download-simple',
    'ph-upload-simple','ph-cloud-check','ph-cloud-arrow-up','ph-sun','ph-moon','ph-circle-half',
    'ph-rss-simple','ph-spotify-logo','ph-apple-podcasts-logo','ph-youtube-logo','ph-play','ph-clock',
    'ph-calendar-blank','ph-file-text','ph-closed-captioning','ph-image-square','ph-arrows-out',
    'ph-bank','ph-chart-line-up','ph-scroll','ph-lock-simple','ph-gift','ph-seal-check','ph-repeat',
    'ph-currency-dollar','ph-currency-circle-dollar','ph-shield-check'
  ];

  /* ── TOAST ─── */
  function toast(msg, variant = '') {
    const t = document.getElementById('cms-toast');
    t.textContent = '';
    const icon = variant === 'error' ? 'ph-warning-circle' : variant === 'success' ? 'ph-check-circle' : 'ph-info';
    t.innerHTML = `<i class="ph-fill ${icon}"></i><span>${escapeHtml(msg)}</span>`;
    t.className = 'cms-toast show' + (variant ? ' ' + variant : '');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2400);
  }

  /* ── ESCAPING ─── */
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  /* ── DATA LOAD ─── */
  async function load() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        state.data = JSON.parse(stored);
        return;
      } catch (e) {
        console.warn('Stored CMS data corrupt, falling back to defaults', e);
      }
    }
    try {
      const res = await fetch('/api/cms/data', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      state.data = await res.json();
    } catch (e) {
      console.error('Could not load /api/cms/data:', e);
      toast('Could not load CMS data — using empty defaults', 'error');
      state.data = emptyData();
    }
  }
  function emptyData() {
    return {
      version: 1, updatedAt: new Date().toISOString(),
      site: { name: 'TEWW', tagline: '', title: '' },
      home: { impactStats: [], statsBand: [], coreValues: [], features: [] },
      projects: { items: [] },
      documents: { blogs: [], stories: [] },
      volunteers: { roles: [], stats: [], steps: [] },
      about: { faqs: [], team: [], board: [], missionStats: [] },
      media: { photos: [], podcasts: [], videos: [], podcastShow: {} },
      donate: { monthlyAmounts: [], onceAmounts: [], impactBreakdown: [] },
      pages: []
    };
  }

  /* ── PERSIST ─── */
  function save({ record = true } = {}) {
    state.data.updatedAt = new Date().toISOString();
    state.data.version = (state.data.version || 0) + (record ? 0 : 0);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    setStatus('saved');
    updateMeta();
    updateCounts();
    if (record) pushHistory();
  }
  function pushHistory() {
    state.history = state.history.slice(0, state.histIdx + 1);
    state.history.push(JSON.stringify(state.data));
    if (state.history.length > HISTORY_LIMIT) state.history.shift();
    state.histIdx = state.history.length - 1;
  }
  function undo() {
    if (state.histIdx <= 0) { toast('Nothing to undo'); return; }
    state.histIdx--;
    state.data = JSON.parse(state.history[state.histIdx]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    render();
    toast('Undone');
  }
  function redo() {
    if (state.histIdx >= state.history.length - 1) { toast('Nothing to redo'); return; }
    state.histIdx++;
    state.data = JSON.parse(state.history[state.histIdx]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    render();
    toast('Redone');
  }

  /* ── STATUS + META ─── */
  function setStatus(kind) {
    const el = document.getElementById('cms-save-status');
    if (!el) return;
    el.classList.remove('saving', 'dirty');
    if (kind === 'saving') { el.classList.add('saving'); el.innerHTML = '<i class="ph ph-circle-notch"></i> Saving…'; }
    else if (kind === 'dirty') { el.classList.add('dirty'); el.innerHTML = '<i class="ph ph-circle"></i> Unsaved changes'; }
    else el.innerHTML = '<i class="ph ph-cloud-check"></i> All changes saved';
  }
  function updateMeta() {
    document.getElementById('cms-version').textContent = state.data.version || 1;
    const d = new Date(state.data.updatedAt || Date.now());
    document.getElementById('cms-updated').textContent = d.toLocaleString();
  }
  function updateCounts() {
    const map = {
      projects: state.data.projects?.items?.length,
      blogs: state.data.documents?.blogs?.length,
      stories: state.data.documents?.stories?.length,
      volunteers: state.data.volunteers?.roles?.length,
      faqs: state.data.about?.faqs?.length,
      team: (state.data.about?.team?.length || 0) + (state.data.about?.board?.length || 0),
      photos: state.data.media?.photos?.length,
      podcasts: state.data.media?.podcasts?.length,
      videos: state.data.media?.videos?.length,
      pages: state.data.pages?.length
    };
    Object.entries(map).forEach(([k, v]) => {
      const el = document.getElementById('count-' + k);
      if (el) el.textContent = v != null ? v : '—';
    });
  }

  /* ── NAV ─── */
  function goSection(name) {
    state.section = name;
    state.editing = null;
    state.search = '';
    document.querySelectorAll('.cms-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.section === name));
    render();
  }

  /* ── RENDER DISPATCH ─── */
  function render() {
    const main = document.getElementById('cms-main');
    const views = {
      dashboard: renderDashboard,
      site: renderSite,
      home: renderHome,
      seo: renderSeo,
      projects: () => renderCollection({
        key: 'projects.items',
        title: 'Projects',
        eyebrow: 'Content',
        sub: 'Each project appears as a card on the Projects page and gets its own detail page at /projects/<slug>.',
        newItem: () => ({
          id: uid(), slug: '', icon: 'ph-stack', title: 'New project', desc: '',
          tag: '', status: 'live', statusLabel: 'Live',
          what: '', how: '', why: '', usage: '', future: '',
        }),
        fields: [
          { k: 'title', label: 'Title', type: 'text', required: true },
          { k: 'slug', label: 'URL slug', type: 'text', required: true, hint: 'Lowercase, no spaces. Becomes /projects/<slug>.' },
          { k: 'icon', label: 'Icon', type: 'icon' },
          { k: 'tag', label: 'Tag label', type: 'text', hint: 'e.g. "AI Assistant · Live on web"' },
          { k: 'status', label: 'Status', type: 'select', options: ['live', 'coming-soon', 'beta'] },
          { k: 'statusLabel', label: 'Status label', type: 'text', hint: 'Shown as a pill on the detail page hero.' },
          { k: 'desc', label: 'Short description (card + hero)', type: 'textarea' },
          { k: 'what', label: 'What is it?', type: 'textarea', hint: 'Rich HTML allowed (e.g. <strong>, <em>).' },
          { k: 'how', label: 'How does it work?', type: 'textarea', hint: 'Rich HTML allowed.' },
          { k: 'why', label: 'Why we built it', type: 'textarea', hint: 'Rich HTML allowed.' },
          { k: 'usage', label: 'How is it used?', type: 'textarea', hint: 'Rich HTML allowed.' },
          { k: 'future', label: 'What is the future of it?', type: 'textarea', hint: 'Rich HTML allowed.' },
        ],
        itemDisplay: (it) => ({ icon: it.icon, title: it.title, meta: (it.slug ? '/projects/' + it.slug : '') + (it.tag ? ' · ' + it.tag : '') })
      }),
      blogs: () => renderCollection({
        key: 'documents.blogs',
        title: 'Blog posts',
        eyebrow: 'Documents',
        sub: 'Articles shown under the Blogs tab.',
        newItem: () => ({ id: uid(), extra: '', heroType: 'type-blog', tagClass: 'blog', tagLabel: 'Blog', cat: 'engineering', title: 'New post', desc: '', author: '', initials: '', meta: '' }),
        fields: [
          { k: 'title', label: 'Title', type: 'text', required: true },
          { k: 'desc', label: 'Summary', type: 'textarea' },
          { k: 'tagLabel', label: 'Tag label', type: 'text' },
          { k: 'cat', label: 'Category', type: 'select', options: ['research','engineering','policy','tutorials'] },
          { k: 'tagClass', label: 'Tag class', type: 'select', options: ['blog','tutorial','policy','report'] },
          { k: 'heroType', label: 'Hero type', type: 'select', options: ['type-blog','type-tutorial','type-policy','type-report'] },
          { k: 'author', label: 'Author', type: 'text' },
          { k: 'initials', label: 'Initials', type: 'text', hint: 'Two letters (e.g. "DR")' },
          { k: 'meta', label: 'Meta', type: 'text', hint: 'e.g. "12 min read · Apr 14"' },
          { k: 'extra', label: 'Featured', type: 'select', options: ['','featured'] }
        ],
        itemDisplay: (it) => ({ iconText: it.initials || '?', title: it.title, meta: `${it.tagLabel} · ${it.author || 'Unknown'} · ${it.meta || ''}` })
      }),
      stories: () => renderCollection({
        key: 'documents.stories',
        title: 'Stories',
        eyebrow: 'Documents',
        sub: 'User-story features shown under the Stories tab.',
        newItem: () => ({ id: uid(), extra: '', heroType: 'type-story', tagClass: 'story', tagLabel: 'Story', cat: '', title: 'New story', desc: '', author: '', initials: '', meta: '' }),
        fields: [
          { k: 'title', label: 'Title', type: 'text', required: true },
          { k: 'desc', label: 'Summary', type: 'textarea' },
          { k: 'heroType', label: 'Hero type', type: 'select', options: ['type-story','type-story2'] },
          { k: 'author', label: 'Author', type: 'text' },
          { k: 'initials', label: 'Initials', type: 'text' },
          { k: 'meta', label: 'Meta', type: 'text' }
        ],
        itemDisplay: (it) => ({ iconText: it.initials || '?', title: it.title, meta: `${it.author || 'Unknown'} · ${it.meta || ''}` })
      }),
      volunteers: () => renderCollection({
        key: 'volunteers.roles',
        title: 'Volunteer roles',
        eyebrow: 'Volunteers',
        sub: 'Each role appears as a card on the Volunteers page.',
        newItem: () => ({ id: uid(), icon: 'ph-hand-heart', title: 'New role', desc: '', tag1: '', tag2: '' }),
        fields: [
          { k: 'title', label: 'Role title', type: 'text', required: true },
          { k: 'icon', label: 'Icon', type: 'icon' },
          { k: 'desc', label: 'Description', type: 'textarea' },
          { k: 'tag1', label: 'Tag 1 (skill)', type: 'text' },
          { k: 'tag2', label: 'Tag 2 (time commitment)', type: 'text' }
        ],
        itemDisplay: (it) => ({ icon: it.icon, title: it.title, meta: `${it.tag1} · ${it.tag2}` })
      }),
      faqs: () => renderCollection({
        key: 'about.faqs',
        title: 'FAQs',
        eyebrow: 'About',
        sub: 'Expandable Q&A items on the About page.',
        newItem: () => ({ id: uid(), num: pad2((state.data.about.faqs || []).length + 1), question: 'New question?', body: '<p></p>', chips: [] }),
        fields: [
          { k: 'num', label: 'Number', type: 'text', hint: 'e.g. "01"' },
          { k: 'question', label: 'Question (HTML allowed)', type: 'textarea' },
          { k: 'body', label: 'Answer (HTML allowed)', type: 'textarea', tall: true }
        ],
        itemDisplay: (it) => ({ iconText: it.num, title: stripHtml(it.question), meta: stripHtml(it.body).slice(0, 80) + '…' })
      }),
      team: renderTeam,
      photos: () => renderCollection({
        key: 'media.photos',
        title: 'Photos',
        eyebrow: 'Media',
        sub: 'Photo gallery items. Images load from URLs (Unsplash recommended).',
        newItem: () => ({ id: uid(), cls: 'p-4-2', cat: 'field', loc: '', caption: '', grad1: '#1f61ff', grad2: '#1349d4', img: '' }),
        fields: [
          { k: 'caption', label: 'Caption', type: 'text', required: true },
          { k: 'loc', label: 'Location', type: 'text' },
          { k: 'img', label: 'Image URL', type: 'text' },
          { k: 'cat', label: 'Category', type: 'select', options: ['field','training','events','team'] },
          { k: 'cls', label: 'Aspect size', type: 'select', options: ['p-6-4','p-3-2','p-4-2','p-4-4','p-6-2'] },
          { k: 'grad1', label: 'Gradient 1 (hex)', type: 'text' },
          { k: 'grad2', label: 'Gradient 2 (hex)', type: 'text' }
        ],
        itemDisplay: (it) => ({ iconText: 'P', title: it.caption, meta: `${it.loc} · ${it.cat}`, thumb: it.img })
      }),
      podcasts: () => renderCollection({
        key: 'media.podcasts',
        title: 'Podcast episodes',
        eyebrow: 'Media',
        sub: 'Episodes shown under the Podcasts tab.',
        newItem: () => ({ id: uid(), num: '000', artV: '', ep: 'Ep 0', title: 'New episode', desc: '', len: '30 min', date: 'Released today' }),
        fields: [
          { k: 'title', label: 'Title', type: 'text', required: true },
          { k: 'ep', label: 'Episode label', type: 'text', hint: 'e.g. "Ep 142"' },
          { k: 'num', label: 'Episode number', type: 'text' },
          { k: 'desc', label: 'Description', type: 'textarea' },
          { k: 'len', label: 'Length', type: 'text', hint: 'e.g. "52 min"' },
          { k: 'date', label: 'Release date', type: 'text' },
          { k: 'artV', label: 'Art variant', type: 'select', options: ['','v2','v3','v4','v5'] }
        ],
        itemDisplay: (it) => ({ iconText: it.num, title: it.title, meta: `${it.ep} · ${it.len} · ${it.date}` })
      }),
      videos: () => renderCollection({
        key: 'media.videos',
        title: 'Videos',
        eyebrow: 'Media',
        sub: 'Videos shown under the Videos tab.',
        newItem: () => ({ id: uid(), bg: 'vid-bg-1', label: 'STORY', dur: '0:00', title: 'New video', cat: 'stories', desc: '', date: '', views: '0 views' }),
        fields: [
          { k: 'title', label: 'Title', type: 'text', required: true },
          { k: 'desc', label: 'Description', type: 'textarea' },
          { k: 'label', label: 'Label', type: 'text', hint: 'e.g. "FEATURE" / "TUTORIAL"' },
          { k: 'dur', label: 'Duration', type: 'text', hint: 'e.g. "4:12"' },
          { k: 'cat', label: 'Category', type: 'select', options: ['stories','tutorials','behind','events'] },
          { k: 'bg', label: 'Background variant', type: 'select', options: ['vid-bg-1','vid-bg-2','vid-bg-3','vid-bg-4','vid-bg-5','vid-bg-6'] },
          { k: 'date', label: 'Release date', type: 'text' },
          { k: 'views', label: 'View count label', type: 'text' }
        ],
        itemDisplay: (it) => ({ iconText: '▶', title: it.title, meta: `${it.label} · ${it.dur} · ${it.date}` })
      }),
      donate: renderDonate,
      pages: () => renderCollection({
        key: 'pages',
        title: 'Custom pages',
        eyebrow: 'Site',
        sub: 'Each entry becomes a live route at <code>/slug</code>. Use the HTML body for layout; hide a page to 404 it.',
        newItem: () => ({ id: uid(), slug: 'new-page', title: 'New page', sections: [{ id: uid(), type: 'rich', html: '<h1>New page</h1>\n<p>Replace this with your content.</p>' }] }),
        fields: [
          { k: 'slug', label: 'URL slug', type: 'text', required: true, hint: 'Used as /slug. Letters, digits, dashes only.' },
          { k: 'title', label: 'Page title', type: 'text', required: true, hint: 'Shown in browser tab.' },
          { k: 'sections.0.html', label: 'Body (HTML allowed)', type: 'textarea', tall: true, hint: 'Full raw HTML. Wrap sections in <section class="section">…</section> to match site spacing.' }
        ],
        itemDisplay: (it) => ({ iconText: '/' + (it.slug || '?').slice(0, 2).toUpperCase(), title: it.title || it.slug, meta: '/' + (it.slug || '') })
      })
    };
    (views[state.section] || renderDashboard)();
    updateCounts();
    updateMeta();
  }

  /* ── DASHBOARD VIEW ─── */
  function renderDashboard() {
    const main = document.getElementById('cms-main');
    const counts = {
      projects: state.data.projects?.items?.length || 0,
      blogs: state.data.documents?.blogs?.length || 0,
      stories: state.data.documents?.stories?.length || 0,
      roles: state.data.volunteers?.roles?.length || 0,
      faqs: state.data.about?.faqs?.length || 0,
      photos: state.data.media?.photos?.length || 0,
      podcasts: state.data.media?.podcasts?.length || 0,
      videos: state.data.media?.videos?.length || 0
    };
    main.innerHTML = `
      <div class="cms-welcome">
        <div>
          <h2>Welcome back.</h2>
          <p>Manage every piece of content on the TEWW site from here. Changes save locally; hit <strong>Publish</strong> to commit the current state to <code>cms-data.json</code>.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="cms-btn cms-btn-primary" onclick="CMS.publish()"><i class="ph-fill ph-cloud-arrow-up"></i> Publish now</button>
          <a class="cms-btn cms-btn-secondary" href="../index.html" target="_blank" rel="noopener"><i class="ph ph-arrow-square-out"></i> Open site</a>
        </div>
      </div>

      <div class="cms-stat-grid">
        ${statCard('ph-stack', counts.projects, 'Projects', 'projects')}
        ${statCard('ph-article', counts.blogs, 'Blog posts', 'blogs')}
        ${statCard('ph-book-open', counts.stories, 'Stories', 'stories')}
        ${statCard('ph-hand-heart', counts.roles, 'Volunteer roles', 'volunteers')}
        ${statCard('ph-chat-circle-dots', counts.faqs, 'FAQs', 'faqs')}
        ${statCard('ph-image', counts.photos, 'Photos', 'photos')}
        ${statCard('ph-microphone', counts.podcasts, 'Podcast episodes', 'podcasts')}
        ${statCard('ph-play-circle', counts.videos, 'Videos', 'videos')}
      </div>

      <div class="cms-page-header" style="margin-top:12px;">
        <div class="cms-page-title-group">
          <div class="cms-page-eyebrow">Quick links</div>
          <h2 class="cms-page-title">Jump into a section</h2>
          <p class="cms-page-sub">Each section supports create, edit, delete, reorder, and search.</p>
        </div>
      </div>

      <div class="cms-stat-grid">
        ${quickLink('ph-gear', 'Site settings', 'Name, tagline, page title', 'site')}
        ${quickLink('ph-house', 'Home page', 'Hero, stats, core values, features', 'home')}
        ${quickLink('ph-users-three', 'Team & board', 'Leadership team and board members', 'team')}
        ${quickLink('ph-heart', 'Donation tiers', 'Monthly / one-time amounts and breakdown', 'donate')}
      </div>
    `;
    bindStatCards();
  }
  function statCard(icon, n, l, section) {
    return `<button class="cms-stat" data-goto="${section}" style="text-align:left;cursor:pointer;">
      <div class="cms-stat-icon"><i class="ph ${icon}"></i></div>
      <div class="cms-stat-n">${n}</div>
      <div class="cms-stat-l">${l}</div>
    </button>`;
  }
  function quickLink(icon, title, sub, section) {
    return `<button class="cms-stat" data-goto="${section}" style="text-align:left;cursor:pointer;">
      <div class="cms-stat-icon"><i class="ph ${icon}"></i></div>
      <div class="cms-stat-n" style="font-size:1.1rem;">${title}</div>
      <div class="cms-stat-l">${sub}</div>
    </button>`;
  }
  function bindStatCards() {
    document.querySelectorAll('[data-goto]').forEach(b => {
      b.addEventListener('click', () => goSection(b.dataset.goto));
    });
  }

  /* ── SITE SETTINGS ─── */
  function renderSite() {
    const main = document.getElementById('cms-main');
    const s = state.data.site || {};
    main.innerHTML = `
      ${pageHeader('Site settings', 'Settings', 'Name, tagline, and document title for the whole website.')}
      <div class="cms-form">
        ${textField('Site name', 'site.name', s.name)}
        ${textField('Tagline', 'site.tagline', s.tagline)}
        ${textField('Document title', 'site.title', s.title, 'Used in the browser tab')}
      </div>
    `;
    bindFieldInputs();
  }

  /* ── HOME PAGE ─── */
  function renderHome() {
    const main = document.getElementById('cms-main');
    const h = state.data.home || {};
    main.innerHTML = `
      ${pageHeader('Home page', 'Home', 'Hero content, live badge, impact stats, and feature cards.')}
      <div class="cms-form">
        <div class="cms-field"><label>Hero eyebrow</label>${plainInput('home.heroEyebrow', h.heroEyebrow)}</div>
        <div class="cms-field"><label>Hero title (HTML)</label>${plainInput('home.heroTitle', h.heroTitle, 'Use <em>…</em> for the colored word')}</div>
        <div class="cms-field"><label>Live badge label</label>${plainInput('home.liveLabel', h.liveLabel)}</div>
        <div class="cms-field"><label>Impact eyebrow</label>${plainInput('home.impactEyebrow', h.impactEyebrow)}</div>
      </div>

      <h3 style="font-family:var(--font-display);font-size:1.05rem;font-weight:700;margin:32px 0 12px;color:var(--fg);">Hero impact stats</h3>
      ${renderSimpleList('home.impactStats', ['number','label'], () => ({ number: '0', label: 'New stat' }))}

      <h3 style="font-family:var(--font-display);font-size:1.05rem;font-weight:700;margin:32px 0 12px;color:var(--fg);">Stats band (below hero)</h3>
      ${renderSimpleList('home.statsBand', ['number','label'], () => ({ number: '0', label: 'New stat' }))}

      <h3 style="font-family:var(--font-display);font-size:1.05rem;font-weight:700;margin:32px 0 12px;color:var(--fg);">Core values</h3>
      ${renderSimpleList('home.coreValues', ['num','icon','title','desc','meta','variant'], () => ({ num: '0X', icon: 'ph-heart', title: 'New value', desc: '', meta: '', variant: 'v-brand' }))}

      <h3 style="font-family:var(--font-display);font-size:1.05rem;font-weight:700;margin:32px 0 12px;color:var(--fg);">What we build (feature cards)</h3>
      ${renderSimpleList('home.features', ['icon','title','desc'], () => ({ icon: 'ph-stack', title: 'New feature', desc: '' }))}
    `;
    bindFieldInputs();
    bindListControls();
  }

  /* ── TEAM ─── */
  function renderTeam() {
    const main = document.getElementById('cms-main');
    main.innerHTML = `
      ${pageHeader('Team & board', 'About', 'Leadership team and board of directors on the About → Team page.')}
      <h3 style="font-family:var(--font-display);font-size:1.05rem;font-weight:700;margin:4px 0 12px;color:var(--fg);">Leadership team</h3>
      ${renderSimpleList('about.team', ['initials','bg','name','role','bio','img'], () => ({ initials: 'NN', bg: 'bg-1', name: 'New Person', role: 'Role', bio: '', img: '' }))}

      <h3 style="font-family:var(--font-display);font-size:1.05rem;font-weight:700;margin:32px 0 12px;color:var(--fg);">Mission stats (About → Mission)</h3>
      ${renderSimpleList('about.missionStats', ['number','label'], () => ({ number: '0', label: 'New stat' }))}

      <h3 style="font-family:var(--font-display);font-size:1.05rem;font-weight:700;margin:32px 0 12px;color:var(--fg);">Board of directors</h3>
      ${renderSimpleList('about.board', ['name','title'], () => ({ name: 'New Director', title: 'Role · Organization' }))}
    `;
    bindFieldInputs();
    bindListControls();
  }

  /* ── DONATE ─── */
  function renderDonate() {
    const main = document.getElementById('cms-main');
    main.innerHTML = `
      ${pageHeader('Donation tiers', 'Give', 'Monthly and one-time amounts, and the impact breakdown shown on the donate page.')}

      <h3 style="font-family:var(--font-display);font-size:1.05rem;font-weight:700;margin:4px 0 12px;color:var(--fg);">Monthly amounts</h3>
      ${renderSimpleList('donate.monthlyAmounts', ['amt','imp'], () => ({ amt: '$25', imp: '3 users / year' }))}

      <h3 style="font-family:var(--font-display);font-size:1.05rem;font-weight:700;margin:32px 0 12px;color:var(--fg);">One-time amounts</h3>
      ${renderSimpleList('donate.onceAmounts', ['amt','imp'], () => ({ amt: '$100', imp: '2 devices funded' }))}

      <h3 style="font-family:var(--font-display);font-size:1.05rem;font-weight:700;margin:32px 0 12px;color:var(--fg);">Impact breakdown</h3>
      ${renderSimpleList('donate.impactBreakdown', ['icon','title','desc'], () => ({ icon: 'ph-stack', title: 'New line item', desc: '' }))}
    `;
    bindFieldInputs();
    bindListControls();
  }

  /* ── SEO ─── */
  // Routes that are editable in the SEO panel. Order controls on-screen order.
  // Adding a route here automatically gives it a per-page override card.
  const SEO_ROUTES = [
    { path: '/',             label: 'Home' },
    { path: '/about',        label: 'About' },
    { path: '/projects',     label: 'Projects' },
    { path: '/donate',       label: 'Donate' },
    { path: '/media',        label: 'Media' },
    { path: '/documents',    label: 'Documents' },
    { path: '/volunteers',   label: 'Volunteer' },
    { path: '/coming-soon',  label: 'Coming soon' },
    { path: '/blog-detail',  label: 'Blog detail (article)' },
    { path: '/story-detail', label: 'Story detail (article)' },
  ];
  // Recommended length bands. Anything outside warns the editor.
  const TITLE_SOFT = { min: 30, max: 60 };
  const DESC_SOFT  = { min: 120, max: 160 };

  function ensureSeoShape() {
    if (!state.data.seo) state.data.seo = {};
    if (!state.data.seo.pages) state.data.seo.pages = {};
    for (const r of SEO_ROUTES) {
      if (!state.data.seo.pages[r.path]) {
        state.data.seo.pages[r.path] = { title: '', description: '', image: '', noindex: false };
      }
    }
  }

  function renderSeo() {
    ensureSeoShape();
    const main = document.getElementById('cms-main');
    const seo = state.data.seo;

    const guidanceCard = `
      <div class="cms-seo-guide" role="note">
        <div class="cms-seo-guide-head">
          <i class="ph-fill ph-lightbulb" aria-hidden="true"></i>
          <h3>Edit without breaking SEO</h3>
        </div>
        <ul>
          <li><strong>Keep titles between 30 and 60 characters.</strong> Google truncates
              beyond ~60. Put the most specific phrase first, the brand last.</li>
          <li><strong>Descriptions: 120–160 characters.</strong> Write for humans: a single
              clear sentence that answers "why click this?".</li>
          <li><strong>Never leave both title and description blank.</strong> A blank override
              falls back to the page's own content, which works — but you lose control
              of the social-share card.</li>
          <li><strong>One H1 per page is baked into the design.</strong> Don't add another
              H1 inside rich-text fields or you'll split the page's topic for crawlers.</li>
          <li><strong>Images should be at least 1200×630 and land in /public/assets.</strong>
              Leave the field blank to use the site-wide generated card.</li>
          <li><strong>Check "no index" only for placeholder, internal, or duplicate pages.</strong>
              A no-indexed page won't appear in Google — useful for /coming-soon,
              disastrous for /projects.</li>
          <li><strong>After publishing, the site and the sitemap update within a minute.</strong>
              You don't need a redeploy.</li>
        </ul>
      </div>
    `;

    const siteDefaults = `
      <h3 class="cms-seo-heading">Site-wide defaults</h3>
      <p class="cms-seo-desc">These appear when a page has no override of its own.</p>
      <div class="cms-form">
        ${textField('Default description (≈150 chars)', 'seo.defaultDescription', seo.defaultDescription, 'Used on the home page when no per-page description is set.')}
        ${textField('Default OG / Twitter image path', 'seo.defaultImage', seo.defaultImage, 'Optional. A public path like /assets/og-default.png. Leave blank to use the auto-generated card.')}
        ${textField('Twitter / X handle', 'seo.twitter', seo.twitter, 'Include the @. Used on every page share card.')}
      </div>
    `;

    const routeCards = SEO_ROUTES.map((r) => {
      const page = seo.pages[r.path] || {};
      const titleLen = (page.title || '').length;
      const descLen = (page.description || '').length;
      const titleWarn = titleLen > 0 && (titleLen < TITLE_SOFT.min || titleLen > TITLE_SOFT.max);
      const descWarn = descLen > 0 && (descLen < DESC_SOFT.min || descLen > DESC_SOFT.max);
      const pathAttr = escapeAttr(r.path);
      return `
        <div class="cms-seo-row">
          <div class="cms-seo-row-head">
            <div>
              <div class="cms-seo-row-path">${escapeHtml(r.path)}</div>
              <div class="cms-seo-row-label">${escapeHtml(r.label)}</div>
            </div>
            <label class="cms-seo-noindex">
              <input type="checkbox" data-seo-path="${pathAttr}" data-seo-field="noindex" ${page.noindex ? 'checked' : ''}>
              <span>Tell search engines not to index this page</span>
            </label>
          </div>
          <div class="cms-seo-row-body">
            <div class="cms-field">
              <label>
                Title
                <span class="cms-seo-counter ${titleWarn ? 'warn' : ''}" data-count-for="${pathAttr}|title">${titleLen} / ${TITLE_SOFT.max}</span>
              </label>
              <input type="text" class="cms-input cms-seo-input" data-seo-path="${pathAttr}" data-seo-field="title" data-seo-len="title" value="${escapeAttr(page.title || '')}">
            </div>
            <div class="cms-field">
              <label>
                Description
                <span class="cms-seo-counter ${descWarn ? 'warn' : ''}" data-count-for="${pathAttr}|description">${descLen} / ${DESC_SOFT.max}</span>
              </label>
              <textarea class="cms-input cms-seo-input" rows="2" data-seo-path="${pathAttr}" data-seo-field="description" data-seo-len="description">${escapeHtml(page.description || '')}</textarea>
            </div>
            <div class="cms-field">
              <label>OG image path (optional)</label>
              <input type="text" class="cms-input" data-seo-path="${pathAttr}" data-seo-field="image" value="${escapeAttr(page.image || '')}" placeholder="/assets/og-about.png">
            </div>
          </div>
        </div>
      `;
    }).join('');

    main.innerHTML = `
      ${pageHeader('SEO', 'Search', 'Titles, descriptions, and social-share cards for every public page.')}
      ${guidanceCard}
      ${siteDefaults}
      <h3 class="cms-seo-heading">Per-page overrides</h3>
      <p class="cms-seo-desc">A blank field falls back to the page content. Clear a field to let it track the page hero automatically.</p>
      <div class="cms-seo-grid">${routeCards}</div>
    `;
    bindFieldInputs(); // site-default text fields use the standard path-based binding
    bindSeoPageInputs();
    bindSeoCounters();
  }

  // Direct binding for per-page fields. Standard data-bind splits on dots,
  // which would shred paths like "/about". Custom writer targets
  // state.data.seo.pages[path][field] instead.
  let seoDebounce;
  function bindSeoPageInputs() {
    document.querySelectorAll('[data-seo-path]').forEach((el) => {
      const handler = () => {
        ensureSeoShape();
        const path = el.getAttribute('data-seo-path');
        const field = el.getAttribute('data-seo-field');
        const val = el.type === 'checkbox' ? el.checked : el.value;
        state.data.seo.pages[path][field] = val;
        setStatus('saving');
        clearTimeout(seoDebounce);
        seoDebounce = setTimeout(() => save(), 400);
      };
      el.addEventListener('input', handler);
      el.addEventListener('change', handler);
    });
  }

  // Live character counters next to each title/description.
  function bindSeoCounters() {
    document.querySelectorAll('[data-seo-len]').forEach((input) => {
      const kind = input.getAttribute('data-seo-len');
      const soft = kind === 'title' ? TITLE_SOFT : DESC_SOFT;
      const path = input.getAttribute('data-seo-path');
      const counter = document.querySelector(`[data-count-for="${path}|${kind}"]`);
      if (!counter) return;
      const update = () => {
        const len = (input.value || '').length;
        counter.textContent = `${len} / ${soft.max}`;
        const warn = len > 0 && (len < soft.min || len > soft.max);
        counter.classList.toggle('warn', warn);
      };
      input.addEventListener('input', update);
    });
  }

  /* ── COLLECTION VIEW (generic) ─── */
  function renderCollection({ key, title, eyebrow, sub, newItem, fields, itemDisplay }) {
    const main = document.getElementById('cms-main');
    const items = deepGet(state.data, key) || [];
    const filtered = !state.search ? items : items.filter(i =>
      JSON.stringify(i).toLowerCase().includes(state.search.toLowerCase())
    );

    main.innerHTML = `
      ${pageHeader(title, eyebrow, sub, `<button class="cms-btn cms-btn-primary" onclick="CMS.addItem('${key}')"><i class="ph-bold ph-plus"></i> New ${title.slice(0,-1).toLowerCase()}</button>`)}
      <div class="cms-toolbar">
        <div class="cms-search">
          <i class="ph ph-magnifying-glass"></i>
          <input type="text" id="cms-search-input" placeholder="Search ${title.toLowerCase()}…" value="${escapeAttr(state.search)}">
        </div>
        <div style="font-size:.82rem;color:var(--fg-muted);">
          Showing ${filtered.length} of ${items.length}
        </div>
      </div>
      <div class="cms-list" id="cms-list">
        ${filtered.length === 0 ? emptyState(title) : filtered.map(it => renderListItem(it, key, itemDisplay)).join('')}
      </div>
      <div id="cms-edit-slot"></div>
    `;
    const searchInput = document.getElementById('cms-search-input');
    searchInput.addEventListener('input', e => {
      state.search = e.target.value;
      render();
      requestAnimationFrame(() => document.getElementById('cms-search-input')?.focus());
    });
    if (state.editing && state.editing.key === key) {
      openEditor(key, state.editing.id, fields);
    }
    // expose the render-config for add/clone operations
    collConfig[key] = { newItem, fields, itemDisplay, title };
  }

  const collConfig = {};

  function renderListItem(it, key, display) {
    const info = display(it);
    const thumb = info.thumb
      ? `<div class="cms-item-ico" style="background-image:url('${escapeAttr(info.thumb)}');background-size:cover;background-position:center;color:transparent;">·</div>`
      : info.icon
        ? `<div class="cms-item-ico"><i class="ph ${escapeAttr(info.icon)}"></i></div>`
        : `<div class="cms-item-ico">${escapeHtml(info.iconText || '·')}</div>`;
    const isHidden = it.visible === false;
    const visIcon = isHidden ? 'ph-eye-slash' : 'ph-eye';
    const visLabel = isHidden ? 'Show on site' : 'Hide from site';
    return `<div class="cms-list-item${isHidden ? ' cms-hidden' : ''}" data-id="${escapeAttr(it.id || '')}">
      ${thumb}
      <div class="cms-item-body">
        <div class="cms-item-title">${escapeHtml(info.title || 'Untitled')}${isHidden ? ' <span class="cms-hidden-tag">Hidden</span>' : ''}</div>
        <div class="cms-item-meta">${escapeHtml(info.meta || '')}</div>
      </div>
      <div class="cms-item-actions">
        <button class="cms-btn cms-btn-icon${isHidden ? ' danger' : ''}" onclick="CMS.toggleVisible('${key}','${it.id}')" aria-label="${visLabel}" title="${visLabel}"><i class="ph ${visIcon}"></i></button>
        <button class="cms-btn cms-btn-icon" onclick="CMS.moveItem('${key}','${it.id}',-1)" aria-label="Move up" title="Move up"><i class="ph ph-arrow-up"></i></button>
        <button class="cms-btn cms-btn-icon" onclick="CMS.moveItem('${key}','${it.id}',1)" aria-label="Move down" title="Move down"><i class="ph ph-arrow-down"></i></button>
        <button class="cms-btn cms-btn-icon" onclick="CMS.editItem('${key}','${it.id}')" aria-label="Edit" title="Edit"><i class="ph ph-pencil-simple"></i></button>
        <button class="cms-btn cms-btn-icon" onclick="CMS.cloneItem('${key}','${it.id}')" aria-label="Duplicate" title="Duplicate"><i class="ph ph-copy"></i></button>
        <button class="cms-btn cms-btn-icon danger" onclick="CMS.deleteItem('${key}','${it.id}')" aria-label="Delete" title="Delete"><i class="ph ph-trash"></i></button>
      </div>
    </div>`;
  }

  function openEditor(key, id, fields) {
    const items = deepGet(state.data, key) || [];
    const idx = items.findIndex(x => x.id === id);
    if (idx < 0) return;
    const it = items[idx];
    state.editing = { key, id };
    document.querySelectorAll('.cms-list-item').forEach(el => el.classList.toggle('editing', el.dataset.id === id));
    const slot = document.getElementById('cms-edit-slot');
    slot.innerHTML = `
      <div class="cms-form" style="margin-top:18px;">
        <div class="cms-page-eyebrow">Editing</div>
        <h3 style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;margin-bottom:8px;">${escapeHtml(it.title || it.name || it.question || 'Item')}</h3>
        ${fields.map(f => renderField(f, it, key + '[' + id + '].' + f.k)).join('')}
        <div class="cms-form-foot">
          <div style="font-size:.78rem;color:var(--fg-muted);">Changes save automatically.</div>
          <div style="display:flex;gap:8px;">
            <button class="cms-btn cms-btn-ghost" onclick="CMS.closeEditor()"><i class="ph ph-x"></i> Close</button>
            <button class="cms-btn cms-btn-danger" onclick="CMS.deleteItem('${key}','${id}')"><i class="ph ph-trash"></i> Delete</button>
          </div>
        </div>
      </div>
    `;
    slot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    bindFieldInputs();
  }

  function renderField(f, it, path) {
    // `k` may be a dot-path (e.g. "sections.0.html") for nested editable fields.
    const raw = f.k.includes('.') || f.k.includes('[') ? deepGet(it, f.k) : it[f.k];
    const val = raw != null ? raw : '';
    const id = 'f_' + path.replace(/[^a-z0-9]/gi, '_');
    const hint = f.hint ? `<div class="hint">${escapeHtml(f.hint)}</div>` : '';
    if (f.type === 'textarea') {
      return `<div class="cms-field">
        <label for="${id}">${f.label}</label>
        <textarea id="${id}" class="cms-textarea ${f.tall ? 'tall' : ''}" data-bind="${path}">${escapeHtml(val)}</textarea>
        ${hint}
      </div>`;
    }
    if (f.type === 'select') {
      return `<div class="cms-field">
        <label for="${id}">${f.label}</label>
        <select id="${id}" class="cms-select" data-bind="${path}">
          ${f.options.map(o => `<option value="${escapeAttr(o)}" ${o === val ? 'selected' : ''}>${o || '— none —'}</option>`).join('')}
        </select>
        ${hint}
      </div>`;
    }
    if (f.type === 'icon') {
      return `<div class="cms-field">
        <label for="${id}">${f.label}</label>
        <div class="cms-icon-input">
          <div class="cms-icon-preview"><i class="ph ${escapeAttr(val)}"></i></div>
          <input id="${id}" type="text" data-bind="${path}" value="${escapeAttr(val)}">
          <button type="button" class="cms-btn cms-btn-ghost cms-btn-sm" onclick="CMS.openIconPicker('${path}')"><i class="ph ph-squares-four"></i> Browse</button>
        </div>
        ${hint}
      </div>`;
    }
    return `<div class="cms-field">
      <label for="${id}">${f.label}</label>
      <input id="${id}" type="text" class="cms-input" data-bind="${path}" value="${escapeAttr(val)}">
      ${hint}
    </div>`;
  }

  /* ── SIMPLE LIST (for inline arrays on Home / Team / Donate) ─── */
  function renderSimpleList(key, fieldKeys, makeNew) {
    const items = deepGet(state.data, key) || [];
    collConfig[key] = { newItem: makeNew, fieldKeys };
    return `<div class="cms-list">
      ${items.length === 0 ? emptyState('items') : items.map((it, i) => `
        <div class="cms-list-item" style="grid-template-columns:1fr auto;padding:16px 18px;align-items:flex-start;">
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:10px;width:100%;">
            ${fieldKeys.map(k => {
              const isLong = k === 'desc' || k === 'bio';
              const path = `${key}[${i}].${k}`;
              const v = it[k] != null ? it[k] : '';
              if (isLong) {
                return `<div class="cms-field" style="grid-column:1/-1;"><label>${k}</label><textarea class="cms-textarea" data-bind="${path}">${escapeHtml(v)}</textarea></div>`;
              }
              return `<div class="cms-field"><label>${k}</label><input class="cms-input" data-bind="${path}" value="${escapeAttr(v)}"></div>`;
            }).join('')}
          </div>
          <div class="cms-item-actions">
            <button class="cms-btn cms-btn-icon" data-simple-move="${key}|${i}|-1" aria-label="Up"><i class="ph ph-arrow-up"></i></button>
            <button class="cms-btn cms-btn-icon" data-simple-move="${key}|${i}|1" aria-label="Down"><i class="ph ph-arrow-down"></i></button>
            <button class="cms-btn cms-btn-icon danger" data-simple-del="${key}|${i}" aria-label="Delete"><i class="ph ph-trash"></i></button>
          </div>
        </div>
      `).join('')}
    </div>
    <button class="cms-btn cms-btn-secondary" style="margin-top:10px;" data-simple-add="${key}"><i class="ph-bold ph-plus"></i> Add item</button>`;
  }

  function bindListControls() {
    document.querySelectorAll('[data-simple-add]').forEach(b => {
      b.addEventListener('click', () => {
        const key = b.dataset.simpleAdd;
        const arr = deepGet(state.data, key);
        const cfg = collConfig[key];
        arr.push(cfg.newItem());
        save();
        render();
      });
    });
    document.querySelectorAll('[data-simple-del]').forEach(b => {
      b.addEventListener('click', () => {
        const [key, idx] = b.dataset.simpleDel.split('|');
        const arr = deepGet(state.data, key);
        arr.splice(parseInt(idx, 10), 1);
        save();
        render();
      });
    });
    document.querySelectorAll('[data-simple-move]').forEach(b => {
      b.addEventListener('click', () => {
        const [key, idx, dir] = b.dataset.simpleMove.split('|');
        const arr = deepGet(state.data, key);
        const i = parseInt(idx, 10), d = parseInt(dir, 10);
        const j = i + d;
        if (j < 0 || j >= arr.length) return;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        save();
        render();
      });
    });
  }

  /* ── FIELD BINDING ─── */
  function bindFieldInputs() {
    document.querySelectorAll('[data-bind]').forEach(el => {
      el.addEventListener('input', onFieldInput);
      el.addEventListener('change', onFieldInput);
    });
  }
  let inputDebounce;
  function onFieldInput(e) {
    const path = e.target.dataset.bind;
    const val = e.target.value;
    setStatus('saving');
    deepSet(state.data, path, val);
    // live icon preview update
    if (path.endsWith('.icon')) {
      const container = e.target.closest('.cms-icon-input');
      if (container) container.querySelector('.cms-icon-preview').innerHTML = `<i class="ph ${escapeHtml(val)}"></i>`;
    }
    clearTimeout(inputDebounce);
    inputDebounce = setTimeout(() => save(), 400);
  }

  /* ── ICON PICKER ─── */
  let iconTargetPath = null;
  function openIconPicker(path) {
    iconTargetPath = path;
    const grid = document.getElementById('cms-icon-grid');
    const search = document.getElementById('cms-icon-search');
    renderIconGrid('');
    search.value = '';
    search.oninput = () => renderIconGrid(search.value);
    document.getElementById('cms-icon-picker').classList.add('open');
    setTimeout(() => search.focus(), 50);
  }
  function renderIconGrid(filter) {
    const grid = document.getElementById('cms-icon-grid');
    const list = !filter ? iconList : iconList.filter(n => n.includes(filter.toLowerCase()));
    grid.innerHTML = list.slice(0, 120).map(n => `
      <button class="cms-icon-pick" data-icon="${n}">
        <i class="ph ${n}"></i>
        <span>${n.replace(/^ph-/, '')}</span>
      </button>
    `).join('');
    grid.querySelectorAll('.cms-icon-pick').forEach(b => {
      b.addEventListener('click', () => {
        if (iconTargetPath) {
          deepSet(state.data, iconTargetPath, b.dataset.icon);
          save();
          render();
        }
        closeIconPicker();
      });
    });
  }
  function closeIconPicker() {
    document.getElementById('cms-icon-picker').classList.remove('open');
    iconTargetPath = null;
  }

  /* ── ITEM CRUD ─── */
  function addItem(key) {
    const cfg = collConfig[key];
    if (!cfg) return;
    const arr = deepGet(state.data, key);
    const item = cfg.newItem();
    arr.unshift(item);
    save();
    state.editing = { key, id: item.id };
    render();
  }
  function editItem(key, id) {
    state.editing = { key, id };
    render();
  }
  function closeEditor() {
    state.editing = null;
    render();
  }
  function cloneItem(key, id) {
    const arr = deepGet(state.data, key);
    const idx = arr.findIndex(x => x.id === id);
    if (idx < 0) return;
    const clone = JSON.parse(JSON.stringify(arr[idx]));
    clone.id = uid();
    if (clone.title) clone.title = clone.title + ' (copy)';
    arr.splice(idx + 1, 0, clone);
    save();
    render();
    toast('Duplicated');
  }
  function deleteItem(key, id) {
    const arr = deepGet(state.data, key);
    const idx = arr.findIndex(x => x.id === id);
    if (idx < 0) return;
    if (!confirm('Delete this item? This can be undone with Ctrl+Z.')) return;
    arr.splice(idx, 1);
    if (state.editing && state.editing.id === id) state.editing = null;
    save();
    render();
    toast('Deleted');
  }
  function moveItem(key, id, dir) {
    const arr = deepGet(state.data, key);
    const i = arr.findIndex(x => x.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    // Renormalise `order` so the site's visibleSorted() honours the new position.
    arr.forEach((it, idx) => { if (it && typeof it === 'object') it.order = idx; });
    save();
    render();
  }
  function toggleVisible(key, id) {
    const arr = deepGet(state.data, key);
    const it = arr && arr.find(x => x.id === id);
    if (!it) return;
    it.visible = it.visible === false ? true : false;
    save();
    render();
    toast(it.visible === false ? 'Hidden from site' : 'Showing on site');
  }

  /* ── IMPORT / EXPORT / PUBLISH ─── */
  function exportJSON() {
    const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cms-data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('Downloaded cms-data.json', 'success');
  }
  function importJSON() {
    document.getElementById('cms-import-file').click();
  }
  function handleImport(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const next = JSON.parse(reader.result);
        if (!next.site || !(next.projects || next.programs)) throw new Error('Missing required sections');
        state.data = next;
        save();
        render();
        toast('Imported successfully', 'success');
      } catch (err) {
        toast('Import failed: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }
  async function publish() {
    setStatus('saving');
    toast('Publishing…');
    try {
      const res = await fetch('/api/cms/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(state.data)
      });
      if (res.status === 401) {
        toast('Session expired — please sign in again.', 'error');
        window.location.href = '/admin/login?callbackUrl=/admin';
        return;
      }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json().catch(() => ({}));
      toast(`Published — revalidated ${json.revalidated || 'all'} routes`, 'success');
      setStatus('saved');
    } catch (err) {
      console.error('Publish failed', err);
      toast('Publish failed: ' + err.message, 'error');
      setStatus('saved');
    }
  }
  function reset() {
    if (!confirm('Reset all CMS content to the shipped defaults? Your localStorage changes will be lost.')) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  /* ── HELPERS ─── */
  function deepGet(obj, path) {
    const parts = path.replace(/\[([^\]]+)\]/g, '.$1').split('.');
    let cur = obj;
    for (const p of parts) {
      if (cur == null) return undefined;
      if (Array.isArray(cur) && /^\d+$/.test(p)) { cur = cur[parseInt(p, 10)]; continue; }
      if (Array.isArray(cur)) {
        cur = cur.find(x => x && x.id === p);
        continue;
      }
      cur = cur[p];
    }
    return cur;
  }
  function deepSet(obj, path, value) {
    const parts = path.replace(/\[([^\]]+)\]/g, '.$1').split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (Array.isArray(cur) && /^\d+$/.test(p)) { cur = cur[parseInt(p, 10)]; continue; }
      if (Array.isArray(cur)) { cur = cur.find(x => x && x.id === p); continue; }
      cur = cur[p];
    }
    const last = parts[parts.length - 1];
    if (Array.isArray(cur) && /^\d+$/.test(last)) cur[parseInt(last, 10)] = value;
    else cur[last] = value;
  }
  function uid() { return 'x' + Math.random().toString(36).slice(2, 9); }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function stripHtml(s) { return String(s || '').replace(/<[^>]+>/g, '').trim(); }

  function pageHeader(title, eyebrow, sub, actions = '') {
    return `<div class="cms-page-header">
      <div class="cms-page-title-group">
        <div class="cms-page-eyebrow">${escapeHtml(eyebrow)}</div>
        <h2 class="cms-page-title">${escapeHtml(title)}</h2>
        <p class="cms-page-sub">${escapeHtml(sub)}</p>
      </div>
      <div class="cms-page-actions">${actions}</div>
    </div>`;
  }
  function textField(label, path, val, hint) {
    return `<div class="cms-field">
      <label>${escapeHtml(label)}</label>
      <input type="text" class="cms-input" data-bind="${escapeAttr(path)}" value="${escapeAttr(val || '')}">
      ${hint ? `<div class="hint">${escapeHtml(hint)}</div>` : ''}
    </div>`;
  }
  function plainInput(path, val, hint) {
    return `<input type="text" class="cms-input" data-bind="${escapeAttr(path)}" value="${escapeAttr(val || '')}">
    ${hint ? `<div class="hint">${escapeHtml(hint)}</div>` : ''}`;
  }
  function emptyState(what) {
    return `<div class="cms-empty">
      <i class="ph ph-folder-open"></i>
      <h3>No ${escapeHtml(what.toLowerCase())} yet</h3>
      <p>Click “New” above to create the first one.</p>
    </div>`;
  }

  /* ── THEME ─── */
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    const next = cur === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('teww-cms-theme', next);
    const btn = document.getElementById('cms-theme-btn');
    btn.innerHTML = next === 'dark' ? '<i class="ph ph-sun"></i>' : '<i class="ph ph-moon"></i>';
    const img = document.getElementById('cms-brand-logo');
    if (img) img.src = next === 'dark' ? '../assets/logo-light.svg' : '../assets/logo.svg';
  }

  /* ── KEYBOARD ─── */
  function onKey(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    else if (e.key === 'Escape') { closeIconPicker(); }
  }

  /* ── INIT ─── */
  async function init() {
    await load();
    pushHistory();
    setStatus('saved');

    document.querySelectorAll('.cms-nav-btn[data-section]').forEach(b => {
      b.addEventListener('click', () => goSection(b.dataset.section));
    });
    document.getElementById('cms-theme-btn').addEventListener('click', toggleTheme);
    document.getElementById('cms-import-file').addEventListener('change', handleImport);
    document.addEventListener('keydown', onKey);

    const storedTheme = localStorage.getItem('teww-cms-theme') || 'light';
    if (storedTheme !== 'light') toggleTheme();

    render();
  }

  return {
    init, render, goSection,
    addItem, editItem, cloneItem, deleteItem, moveItem, toggleVisible,
    openIconPicker, closeIconPicker,
    exportJSON, importJSON, publish, reset,
    undo, redo, closeEditor
  };
})();

window.CMS = CMS;
document.addEventListener('DOMContentLoaded', CMS.init);
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  // Already past DOMContentLoaded — init now.
  Promise.resolve().then(CMS.init);
}
