import { visibleSorted } from '@/lib/cms/db';
import { esc, rich } from '@/lib/pages/_helpers';

function impactCell(it) {
  return `<div class="hi-cell">
    <div class="hi-n">${rich(it.number)}</div>
    <div class="hi-l">${esc(it.label)}</div>
  </div>`;
}

function statBlock(it) {
  return `<div class="stat-block"><span class="num">${rich(it.number)}</span><span class="lbl">${esc(it.label)}</span></div>`;
}

function valCard(it) {
  const variant = esc(it.variant || 'v-brand');
  return `<li class="val-card ${variant}">
    <div class="val-num">${esc(it.num)}</div>
    <div class="val-ico"><i class="ph ${esc(it.icon)}"></i></div>
    <h3>${esc(it.title)}</h3>
    <p>${esc(it.desc)}</p>
    <div class="val-meta"><span>${esc(it.meta)}</span></div>
  </li>`;
}

function featureCard(it) {
  return `<div class="feature-card">
    <div class="feature-icon"><i class="ph ${esc(it.icon)}"></i></div>
    <h3>${esc(it.title)}</h3>
    <p>${esc(it.desc)}</p>
    <a class="card-link" href="#" onclick="goto('projects');return false;">Learn more <i class="ph ph-arrow-right"></i></a>
  </div>`;
}

function storyCard(it, featured = false) {
  const hero = esc(it.heroType || 'type-story');
  const tag = esc(it.tagClass || 'story');
  const tagLabel = esc(it.tagLabel || 'Story');
  const target = hero === 'type-blog' ? "goto('documents','blogs')" : "goto('documents','stories')";
  const bg = it.img ? `background-image: linear-gradient(180deg, rgba(0,0,0,.05) 30%, rgba(13,4,7,.75) 100%), url('${esc(it.img)}'); background-size: cover; background-position: center;` : '';
  return `<div class="doc-card${featured ? ' featured' : ''}" onclick="${target}">
    <div class="doc-hero ${hero}"${bg ? ` style="${bg}"` : ''}>
      <div>
        <span class="cat-tag ${tag}">${tagLabel}</span>
        <h3>${esc(it.title)}</h3>
      </div>
    </div>
    <div class="doc-body">
      <p>${esc(it.desc)}</p>
      <div class="doc-meta">
        <div class="doc-author"><div class="avatar">${esc(it.initials || 'TE')}</div><span>${esc(it.author || '')}</span></div>
        <span class="sep">·</span><span>${esc(it.meta || it.readTime || '')}</span>
      </div>
    </div>
  </div>`;
}

function timelineRow(it) {
  const monthDay = (it.date || '').split(' ');
  const month = esc(monthDay[0] || '');
  const day = esc(monthDay[1] || '');
  return `<li class="story-row" onclick="goto('documents','stories')">
    <div class="sr-rail"><span class="sr-dot"></span></div>
    <div class="sr-date"><div class="sr-month">${month}</div><div class="sr-day">${day}</div></div>
    <div class="sr-body">
      <div class="sr-tags">
        <span class="cat-tag story">Story</span>
        ${it.location ? `<span class="sr-loc">${esc(it.location)}</span>` : ''}
      </div>
      <h4>${esc(it.title)}</h4>
      <p>${esc(it.desc)}</p>
      <div class="sr-meta">
        <div class="avatar sm">${esc(it.initials || 'TE')}</div>
        <span>${esc(it.author || '')}</span><span class="sep">·</span><span>${esc(it.meta || '')}</span>
      </div>
    </div>
  </li>`;
}

export function renderHome(content) {
  const h = content?.home || {};
  const docs = content?.documents || {};
  const impactStats = visibleSorted(h.impactStats || []);
  const statsBand = visibleSorted(h.statsBand || []);
  const values = visibleSorted(h.coreValues || []);
  const features = visibleSorted(h.features || []);
  const stories = visibleSorted(docs.stories || []);
  const blogs = visibleSorted(docs.blogs || []);

  const latest = [stories[0], blogs[0], stories[1]].filter(Boolean);
  const timelineStories = stories.slice(0, 5);
  const featured = timelineStories[0] || docs.featuredStory || {};

  return `
  <section class="hero">
    <div class="hero-photo" aria-hidden="true"></div>
    <div class="hero-graphics" aria-hidden="true">
      <svg class="hg-rings" viewBox="0 0 400 400" fill="none" stroke="currentColor" stroke-width="1">
        <circle cx="200" cy="200" r="80"/>
        <circle cx="200" cy="200" r="130"/>
        <circle cx="200" cy="200" r="180" stroke-dasharray="4 8"/>
      </svg>
      <svg class="hg-eye" viewBox="0 0 220 257.57" fill="currentColor">
        <path d="M212.24,8.45c-5.74-5.63-13.38-8.45-22.94-8.45H0v57.17c13.39-5.17,28.43-8.08,44.32-8.08,32.4,0,61.24,12.06,79.89,30.85,3.56,3.59,3.56,9.32,0,12.9-18.65,18.79-47.49,30.86-79.89,30.86-5.32,0-10.54-.33-15.64-.96-10.14-1.24-19.77-3.69-28.68-7.13v108.45c0,9.77,2.86,17.47,8.6,23.11,5.74,5.63,13.38,8.45,22.94,8.45h189.29v-57.17c-13.4,5.17-28.43,8.08-44.32,8.08-32.4,0-61.25-12.06-79.89-30.85-3.56-3.59-3.56-9.32,0-12.9,18.64-18.79,47.49-30.86,79.89-30.86,5.32,0,10.54.33,15.64.96,10.13,1.24,19.76,3.69,28.68,7.13V31.55c0-9.77-2.86-17.48-8.6-23.11Z"/>
      </svg>
      <div class="hg-dots"></div>
      <span class="hg-line l1"></span>
      <span class="hg-line l2"></span>
      ${h.liveLabel ? `<span class="hg-live"><span class="dot"></span> ${esc(h.liveLabel)}</span>` : ''}
    </div>
    <div class="hero-inner">
      ${h.heroEyebrow ? `<div class="hero-eyebrow">${esc(h.heroEyebrow)}</div>` : ''}
      <h1 class="hero-title">${rich(h.heroTitle || '')}</h1>
      ${h.impactEyebrow ? `<div class="hero-impact-eyebrow">${esc(h.impactEyebrow)}</div>` : ''}
      ${impactStats.length ? `<div class="hero-impact">${impactStats.map(impactCell).join('')}</div>` : ''}
      <div class="hero-btns">
        <button class="btn-accent" onclick="goto('donate')"><i class="ph-fill ph-heart"></i> Donate Now</button>
        <button class="btn-ghost" onclick="goto('projects')">Our Projects <i class="ph ph-arrow-right"></i></button>
        <button class="hero-listen" aria-label="Listen to an audio tour of this page" onclick="startAudioTour()"><i class="ph ph-speaker-high"></i> Listen to audio tour</button>
      </div>
    </div>
  </section>

  ${statsBand.length ? `<div class="stats-band">
    <div class="section-inner">
      ${statsBand.map(statBlock).join('')}
    </div>
  </div>` : ''}

  ${values.length ? `<section class="values-section">
    <div class="values-bg" aria-hidden="true">
      <span class="vbg-ring r1"></span>
      <span class="vbg-ring r2"></span>
    </div>
    <div class="section-inner values-inner">
      <header class="values-head">
        ${h.coreValuesEyebrow ? `<div class="section-eyebrow">${esc(h.coreValuesEyebrow)}</div>` : ''}
        <h2 class="values-title">${rich(h.coreValuesTitle || '')}</h2>
        ${h.coreValuesSub ? `<p class="values-sub">${esc(h.coreValuesSub)}</p>` : ''}
      </header>
      <ol class="values-grid" role="list">
        ${values.map(valCard).join('')}
      </ol>
    </div>
  </section>` : ''}

  ${features.length ? `<section class="section">
    <div class="section-inner">
      <div class="section-heading">
        <div class="section-eyebrow">What We Build</div>
        <h2 class="section-title">Tools built for every kind of vision</h2>
        <p class="section-subtitle">Our assistive technology works across devices, languages, and environments — from smartphones on a village network to desktop workstations.</p>
      </div>
      <div class="feature-grid">
        ${features.map(featureCard).join('')}
      </div>
    </div>
  </section>` : ''}

  ${latest.length ? `<section class="section section-alt">
    <div class="section-inner">
      <div class="section-heading left" style="max-width:720px;">
        <div class="section-eyebrow">Latest Stories</div>
        <h2 class="section-title">Voices from our community</h2>
        <p class="section-subtitle">Real people, real independence. The work is never about us — it's about what becomes possible.</p>
      </div>
      <div class="doc-grid">
        ${latest.map((s, i) => storyCard(s, i === 0)).join('')}
      </div>
    </div>
  </section>` : ''}

  ${timelineStories.length ? `<section class="story-timeline">
    <div class="section-inner">
      <header class="story-head">
        <div class="story-eyebrow">
          <span class="ribbon-dot"></span>
          <span>The Archive</span>
          <span class="story-count">· ${new Date().getFullYear()}</span>
        </div>
        <h2 class="story-h2">Every story we've published,<br><em>newest first.</em></h2>
      </header>

      <article class="story-featured" onclick="goto('documents','stories')">
        <div class="sf-media" aria-hidden="true">
          <div class="sf-photo"></div>
          <svg class="sf-rings" viewBox="0 0 400 400" fill="none" stroke="currentColor" stroke-width="1">
            <circle cx="200" cy="200" r="60"/>
            <circle cx="200" cy="200" r="110" stroke-dasharray="2 6"/>
            <circle cx="200" cy="200" r="160"/>
          </svg>
          <div class="sf-badge"><i class="ph-fill ph-star"></i><span>Newest story</span></div>
        </div>
        <div class="sf-body">
          <div class="sf-meta-top">
            <span class="cat-tag story">Story</span>
            <span class="sf-read"><i class="ph ph-clock"></i> ${esc(featured.meta || featured.readTime || '8 min read')}</span>
          </div>
          <h3 class="sf-title">${esc(featured.title || '')}</h3>
          <p class="sf-excerpt">${esc(featured.desc || featured.excerpt || '')}</p>
          <div class="sf-footer">
            <div class="sf-author">
              <div class="avatar lg" aria-hidden="true">${esc(featured.initials || 'TE')}</div>
              <div class="sf-author-text">
                <div class="sf-author-name">${esc(featured.author || '')}</div>
              </div>
            </div>
            <button class="sf-read-btn" type="button">Read the full story <i class="ph ph-arrow-up-right"></i></button>
          </div>
        </div>
      </article>

      <ol class="story-list" role="list">
        ${timelineStories.map(timelineRow).join('')}
      </ol>

      <div class="story-foot">
        <button class="btn-ghost" onclick="goto('documents','stories')">Browse the full archive <i class="ph ph-arrow-right"></i></button>
        <div class="story-foot-meta">Updated weekly · ${stories.length} stories in the archive</div>
      </div>
    </div>
  </section>` : ''}

  <section class="cta-band">
    <div class="cta-inner">
      <h2>Your support opens worlds.</h2>
      <p>$10 a month connects one user for a full year. Every contribution funds free tools, free training, and free devices for those who need them most.</p>
      <div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;">
        <button class="btn-accent" onclick="goto('donate')"><i class="ph-fill ph-heart"></i> Donate Monthly</button>
        <button class="btn-secondary" onclick="goto('volunteers')">Become a Volunteer</button>
      </div>
    </div>
  </section>
  `;
}
