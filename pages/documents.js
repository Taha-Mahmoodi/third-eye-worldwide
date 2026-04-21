function renderDocuments() {
  return `
  <div class="page-hero">
    <div class="page-hero-inner">
      <div class="section-eyebrow">Documents</div>
      <h1>Read <em>deeper.</em></h1>
      <p>Long-form writing from our team and community — research, opinion, and the stories of people our work reaches.</p>
    </div>
  </div>

  <nav class="subnav" aria-label="Documents sections">
    <div class="subnav-inner">
      <button data-sub="blogs" class="active" onclick="activateSub('documents','blogs')">Blogs</button>
      <button data-sub="stories" onclick="activateSub('documents','stories')">Stories</button>
    </div>
  </nav>

  <!-- BLOGS -->
  <div class="subpage active" data-sub="blogs">
    <section class="section">
      <div class="section-inner">
        <div class="filter-bar" data-filter-group="blogs" onclick="filterPills(this, event.target.dataset.filter || 'all')">
          <div class="filter-label">Topic</div>
          <button class="filter-pill active" data-filter="all">All</button>
          <button class="filter-pill" data-filter="research">Research</button>
          <button class="filter-pill" data-filter="engineering">Engineering</button>
          <button class="filter-pill" data-filter="policy">Policy</button>
          <button class="filter-pill" data-filter="tutorials">Tutorials</button>
        </div>

        <div class="doc-grid">
          ${doc('featured','type-blog','blog','Research','research','What WCAG misses — and how we test for it','Our field research methodology, and why audits alone will never be enough to guarantee accessibility in the real world.','Dr. Rhea Nair','DR','12 min read · Apr 14')}
          ${doc('','type-tutorial','tutorial','Tutorial','tutorials',"A developer's guide to proper ARIA labels",'The five mistakes we see most often, and the simple fixes that make your app usable.','Tomás Luján','TL','6 min · Apr 10')}
          ${doc('','type-policy','policy','Policy','policy','Inside the EU Accessibility Act','What the 2025 deadline means for every digital service in Europe.','Fatima Al-Harbi','FA','9 min · Apr 3')}
        </div>

        <div class="doc-grid" style="margin-top:24px;">
          ${doc('','type-report','report','Research','research','Measuring digital independence','A new framework for evaluating assistive-tech impact — developed across four field sites.','Dr. Rhea Nair','DR','15 min · Mar 28')}
          ${doc('','type-blog','blog','Engineering','engineering','Shipping an offline-first screen reader','Why our latest release works with zero data, and how we got there.','Priya Sharma','PS','8 min · Mar 22')}
          ${doc('','type-tutorial','tutorial','Tutorial','tutorials','Configuring Navigation Aid for your city','Step-by-step: import transit data, tag stops, deploy to users.','Juma Kimani','JK','11 min · Mar 15')}
        </div>

        <div class="doc-grid" style="margin-top:24px;">
          ${doc('','type-policy','policy','Policy','policy','Accessible voting — three country study','How Brazil, Kenya, and India are each solving the accessible-ballot problem.','Beatriz Coelho','BC','14 min · Mar 8')}
          ${doc('','type-blog','blog','Engineering','engineering','Building with variable fonts for low-vision users','A technical deep-dive on optical sizing, weight, and contrast.','Tomás Luján','TL','7 min · Feb 28')}
          ${doc('','type-report','report','Research','research','The cost of inaccessibility','Economic analysis of global productivity loss due to inaccessible digital infrastructure.','Prof. Ian Wells','IW','22 min · Feb 14')}
        </div>

        <div style="display:flex;justify-content:center;margin-top:48px;">
          <button class="btn-secondary">Load more posts</button>
        </div>
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

  <!-- STORIES -->
  <div class="subpage" data-sub="stories">
    <section class="section">
      <div class="section-inner">
        <div class="section-heading left" style="max-width:720px;margin-bottom:32px;">
          <div class="section-eyebrow">Stories</div>
          <h2 class="section-title">Voices from our community</h2>
          <p class="section-subtitle">Real people, real independence. These are the stories that remind us why the work matters.</p>
        </div>

        <!-- Featured hero story -->
        <article style="display:grid;grid-template-columns:1.2fr 1fr;gap:40px;margin-bottom:56px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-xl);overflow:hidden;box-shadow:var(--shadow-md);">
          <div style="aspect-ratio:4/5;background:linear-gradient(135deg, var(--accent) 0%, #c04c18 100%);display:flex;align-items:flex-end;padding:40px;color:#fff;position:relative;overflow:hidden;">
            <div style="position:relative;z-index:1;">
              <div style="font-family:var(--font-display);font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.85;margin-bottom:10px;">Featured Story · 12 min read</div>
              <div style="font-family:var(--font-display);font-size:4rem;font-weight:700;line-height:.95;letter-spacing:-.04em;">"</div>
              <div style="font-family:var(--font-display);font-size:1.6rem;font-weight:500;line-height:1.25;letter-spacing:-.015em;margin-top:-20px;">For the first time, the internet feels like mine too.</div>
            </div>
            <div style="position:absolute;bottom:-60px;right:-60px;width:280px;height:280px;border-radius:50%;background:rgba(255,255,255,.08);"></div>
          </div>
          <div style="padding:40px;display:flex;flex-direction:column;justify-content:center;">
            <h3 style="font-family:var(--font-display);font-size:1.75rem;font-weight:700;color:var(--fg);margin-bottom:16px;letter-spacing:-.02em;line-height:1.2;">Amara Mwangi started her own delivery business this year. She also happens to be blind.</h3>
            <p style="color:var(--fg-muted);line-height:1.7;margin-bottom:20px;">A year ago, Amara had never used a smartphone. Today, she runs a food delivery business in Lagos with 40 regular customers. We spent a week with her learning how TEWW's Screen Reader and Navigation Aid fit into her day — and what the tools still need to become.</p>
            <div style="display:flex;align-items:center;gap:12px;padding-top:20px;border-top:1px solid var(--border);">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#4d7eff,#1f61ff);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:.85rem;">MO</div>
              <div>
                <div style="font-family:var(--font-display);font-weight:600;font-size:.92rem;color:var(--fg);">Maya Osei</div>
                <div style="font-size:.8rem;color:var(--fg-muted);">Chief Program Officer · Published Apr 17, 2026</div>
              </div>
              <button class="btn-primary" style="margin-left:auto;font-size:.88rem;padding:10px 20px;" onclick="goto('story-detail')">Read <i class="ph ph-arrow-right"></i></button>
            </div>
          </div>
        </article>

        <h3 style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:var(--fg);margin-bottom:18px;">More stories</h3>
        <div class="doc-grid">
          ${doc('','type-story','story','Story','','Kofi builds a software company from his kitchen','Born blind. Taught himself to code. Now ships accessibility tools to 200,000 developers.','Maya Osei','MO','8 min · Apr 12')}
          ${doc('','type-story2','story','Story','','Miriam rides solo — the Nairobi matatu system, unassisted',"How the Navigation Aid integrates with one of the world's most informal transit networks.",'Juma Kimani','JK','4 min · Apr 5')}
          ${doc('','type-story','story','Story','','Ten students, one year of code','The inaugural class of Access Scholars graduates from Cairo.','Fatima Al-Harbi','FA','9 min · Mar 30')}
        </div>

        <div class="doc-grid" style="margin-top:24px;">
          ${doc('','type-story2','story','Story','','Dhaka after the flood','How a Device Lending Library helped families rebuild.','Priya Sharma','PS','6 min · Mar 22')}
          ${doc('','type-story','story','Story','',"Sebastián's first job interview",'Low-vision, 22, freshly employed as a junior developer.','Beatriz Coelho','BC','5 min · Mar 15')}
          ${doc('','type-story2','story','Story','','The translator guild','Meet five of the 240 volunteers localising our tools.','Sofia Ferreira','SF','10 min · Mar 8')}
        </div>

        <div style="display:flex;justify-content:center;margin-top:48px;">
          <button class="btn-secondary">Load more stories</button>
        </div>
      </div>
    </section>
  </div>`;
}

function doc(extraClass, heroType, tagClass, tagLabel, cat, title, desc, author, initials, meta, openPage) {
  // Blogs navigate to the blog detail; stories navigate to the story detail.
  // Explicit override via openPage arg wins.
  const target = openPage || (tagClass === 'story' ? 'story-detail' : 'blog-detail');
  const safeTitle = String(title).replace(/"/g, '&quot;');
  return `<div class="doc-card ${extraClass}" data-filter-target="blogs" data-cat="${cat}" role="link" tabindex="0" aria-label="Read: ${safeTitle}" onclick="goto('${target}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();goto('${target}');}" style="cursor:pointer;">
    <div class="doc-hero ${heroType}">
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
