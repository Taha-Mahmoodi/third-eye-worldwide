import { visibleSorted } from '@/lib/cms/db';

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}
function rich(s) { return s == null ? '' : String(s); }

function teamCard(it) {
  const initials = esc(it.initials || 'TE');
  const bg = esc(it.bg || 'bg-1');
  const name = esc(it.name || '');
  const role = esc(it.role || '');
  const bio = esc(it.bio || '');
  const img = it.img || '';
  const photo = img
    ? `<img class="team-photo-img" src="${esc(img)}" alt="Portrait of ${name}" loading="lazy">`
    : '';
  return `<div class="team-card">
    <div class="team-photo ${bg}${img ? ' has-img' : ''}">${photo}<span class="initials" aria-hidden="${img ? 'true' : 'false'}">${initials}</span></div>
    <h4>${name}</h4>
    <div class="role">${role}</div>
    <p class="bio">${bio}</p>
  </div>`;
}

function boardRow(it) {
  const name = esc(it.name || '');
  const title = esc(it.title || '');
  const initials = name.split(' ').map((w) => w[0] || '').slice(0, 2).join('');
  return `<div style="display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid var(--border);">
    <div style="display:flex;align-items:center;gap:14px;">
      <div style="width:36px;height:36px;border-radius:50%;background:var(--bg-subtle);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:.78rem;color:var(--fg-muted);">${esc(initials)}</div>
      <div>
        <div style="font-family:var(--font-display);font-weight:600;color:var(--fg);font-size:.95rem;">${name}</div>
        <div style="font-size:.82rem;color:var(--fg-muted);">${title}</div>
      </div>
    </div>
    <i class="ph ph-arrow-up-right" style="color:var(--fg-subtle);"></i>
  </div>`;
}

function faqItem(it) {
  return `<details class="faq-item">
    <summary>
      <div class="faq-num">${esc(it.num || '')}</div>
      <div class="faq-q">${rich(it.question || '')}</div>
      <div class="faq-chev"><i class="ph-bold ph-plus"></i></div>
    </summary>
    <div class="faq-panel">${rich(it.body || '')}</div>
  </details>`;
}

function missionStatCell(it) {
  return `<div class="about-stat"><div class="n">${rich(it.number || '')}</div><div class="l">${esc(it.label || '')}</div></div>`;
}

const FAQ_STYLE = `
  <style>
    .faq-wrap { max-width: 880px; margin: 0 auto; padding: 0 var(--space-8); display: flex; flex-direction: column; gap: 18px; }
    .faq-intro-row { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: end; margin-bottom: 48px; padding-bottom: 32px; border-bottom: 1px solid var(--border); }
    .faq-intro-row h2 { font-family: var(--font-display); font-weight: 700; font-size: clamp(1.9rem, 3.2vw, 2.6rem); letter-spacing: -.035em; line-height: 1.1; color: var(--fg); text-wrap: balance; }
    .faq-intro-row h2 em { font-style: normal; color: var(--brand); }
    .faq-intro-row p { font-size: 1.02rem; color: var(--fg-muted); line-height: 1.65; }
    .faq-counter { font-family: var(--font-display); font-weight: 700; font-size: .72rem; letter-spacing: .2em; text-transform: uppercase; color: var(--fg-subtle); margin-bottom: 10px; display: block; }
    details.faq-item { border: 1px solid var(--border); border-radius: var(--radius-xl); background: var(--bg-elevated); overflow: hidden; transition: border-color .25s, box-shadow .25s; }
    details.faq-item[open] { border-color: var(--border-strong); box-shadow: var(--shadow-sm); }
    details.faq-item:hover:not([open]) { border-color: var(--border-strong); }
    details.faq-item > summary { list-style: none; cursor: pointer; padding: 28px 32px; display: grid; grid-template-columns: 56px 1fr 40px; align-items: center; gap: 20px; outline: none; }
    details.faq-item > summary::-webkit-details-marker { display: none; }
    .faq-num { font-family: var(--font-display); font-weight: 700; font-size: .78rem; letter-spacing: .14em; color: var(--fg-subtle); border: 1px solid var(--border); padding: 8px 10px; border-radius: 10px; text-align: center; transition: color .2s, border-color .2s, background .2s; }
    details.faq-item[open] .faq-num { color: var(--brand); border-color: var(--brand); background: var(--brand-subtle); }
    .faq-q { font-family: var(--font-display); font-weight: 700; font-size: clamp(1.15rem, 1.6vw, 1.4rem); letter-spacing: -.02em; line-height: 1.25; color: var(--fg); text-wrap: balance; }
    .faq-q em { font-style: italic; font-weight: 600; color: var(--accent); }
    .faq-chev { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--bg-subtle); color: var(--fg-muted); border: 1px solid var(--border); transition: transform .3s ease, background .2s, color .2s; font-size: 16px; }
    details.faq-item[open] .faq-chev { transform: rotate(45deg); background: var(--brand); color: white; border-color: var(--brand); }
    .faq-panel { padding: 4px 32px 34px 108px; border-top: 1px dashed var(--border); margin-top: 0; animation: faqFade .35s ease; }
    @keyframes faqFade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    .faq-panel > p + p { margin-top: 14px; }
    .faq-panel p { font-size: 1rem; line-height: 1.72; color: var(--fg-muted); max-width: 62ch; }
    .faq-panel p strong { color: var(--fg); font-weight: 600; }
    .faq-panel ul { list-style: none; padding: 0; margin: 18px 0 6px; display: flex; flex-direction: column; gap: 10px; }
    .faq-panel li { font-size: .98rem; color: var(--fg-muted); line-height: 1.55; padding-left: 24px; position: relative; }
    .faq-panel li::before { content: ''; position: absolute; left: 0; top: 10px; width: 14px; height: 2px; background: var(--accent); }
    .faq-panel li strong { color: var(--fg); font-weight: 600; }
    .faq-stats { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px; padding-top: 20px; border-top: 1px solid var(--border); }
    .faq-chip { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; background: var(--bg-subtle); border: 1px solid var(--border); border-radius: 999px; font-family: var(--font-display); font-size: .78rem; font-weight: 600; color: var(--fg); }
    .faq-chip i { color: var(--brand); font-size: 14px; }
    .faq-chip.accent i { color: var(--accent); }
    .faq-cta { margin-top: 56px; padding: 40px 44px; border: 1px solid var(--border); border-radius: var(--radius-xl); background: var(--bg-elevated); display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
    .faq-cta h3 { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; letter-spacing: -.02em; color: var(--fg); margin-bottom: 6px; }
    .faq-cta p { font-size: .94rem; color: var(--fg-muted); }
    .faq-cta-btns { display: flex; gap: 12px; flex-wrap: wrap; }
    @media (max-width: 720px) {
      .faq-intro-row { grid-template-columns: 1fr; gap: 18px; }
      details.faq-item > summary { padding: 22px 20px; grid-template-columns: 44px 1fr 32px; gap: 14px; }
      .faq-panel { padding: 4px 22px 26px 22px; }
      .faq-chev { width: 32px; height: 32px; }
      .faq-cta { padding: 28px 24px; }
    }
  </style>
`;

export function renderAbout(content) {
  const a = content?.about || {};
  const faqs = visibleSorted(a.faqs || []);
  const team = visibleSorted(a.team || []);
  const board = visibleSorted(a.board || []);
  const missionStats = visibleSorted(a.missionStats || []);

  return `
  ${FAQ_STYLE}

  <div class="page-hero">
    <div class="page-hero-inner">
      <div class="section-eyebrow">${esc(a.heroEyebrow || 'About Us')}</div>
      <h1>${rich(a.heroTitle || 'About us.')}</h1>
      ${a.heroSub ? `<p>${esc(a.heroSub)}</p>` : ''}
    </div>
  </div>

  <nav class="subnav" aria-label="About sections">
    <div class="subnav-inner">
      <button data-sub="faq" class="active" onclick="activateSub('about','faq')">Overview</button>
      <button data-sub="mission" onclick="activateSub('about','mission')">Mission</button>
      <button data-sub="team" onclick="activateSub('about','team')">Team</button>
    </div>
  </nav>

  <div class="subpage active" data-sub="faq">
    <section class="section">
      <div class="faq-wrap">
        <div class="faq-intro-row">
          <div>
            <span class="faq-counter">${faqs.length} Questions · ${faqs.length} Answers</span>
            <h2>Everything you'd want to ask on <em>day one.</em></h2>
          </div>
          <p>Tap any question to expand. No marketing fluff — just the things people actually ask us.</p>
        </div>

        ${faqs.map(faqItem).join('') || '<p style="color:var(--fg-muted);">No questions yet.</p>'}

        <div class="faq-cta">
          <div>
            <h3>Still have a question?</h3>
            <p>We publish answers to everything — press, partners, skeptics, job seekers.</p>
          </div>
          <div class="faq-cta-btns">
            <button class="btn-primary" onclick="goto('volunteers')"><i class="ph ph-hand-heart"></i> Join the team</button>
            <button class="btn-secondary" onclick="goto('documents')">Read more</button>
          </div>
        </div>
      </div>
    </section>
  </div>

  <div class="subpage" data-sub="mission">
    <section class="section">
      <div class="section-inner">
        <div class="about-grid">
          <div>
            <div class="section-eyebrow" style="margin-bottom:14px;">Our Mission</div>
            <h2 style="font-family:var(--font-display);font-size:clamp(1.75rem,2.8vw,2.5rem);font-weight:700;letter-spacing:-.03em;line-height:1.1;color:var(--fg);margin-bottom:20px;">Technology as the third eye.</h2>
            <p style="font-size:1.05rem;color:var(--fg-muted);line-height:1.75;margin-bottom:16px;">We were founded in 2025 on a single belief: that technology should give visually impaired individuals the same digital access as everyone else — no compromise, no watered-down experience.</p>
            <p style="font-size:1.05rem;color:var(--fg-muted);line-height:1.75;margin-bottom:24px;">Today, we operate in 47 countries. Our team of 120 staff and 800+ volunteers builds, distributes, and teaches assistive technology to those who need it most.</p>
            <div style="display:flex;gap:14px;flex-wrap:wrap;">
              <button class="btn-primary" onclick="goto('volunteers')"><i class="ph ph-hand-heart"></i> Join Us</button>
              <button class="btn-secondary" onclick="goto('projects')">See Projects</button>
            </div>
          </div>
          <div class="about-visual">
            ${missionStats.map(missionStatCell).join('') || ''}
          </div>
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="section-inner">
        <div class="section-heading">
          <div class="section-eyebrow">Our Pillars</div>
          <h2 class="section-title">What guides everything we build</h2>
        </div>
        <div class="pillars">
          <div class="pillar">
            <div class="num-badge">01</div>
            <h3>Radical Accessibility</h3>
            <p>Every product decision is evaluated first against a single question: can a visually impaired person use this independently?</p>
          </div>
          <div class="pillar">
            <div class="num-badge">02</div>
            <h3>Equity by Default</h3>
            <p>We design for low-bandwidth environments, older devices, and users who may not have a reliable data plan or power source.</p>
          </div>
          <div class="pillar">
            <div class="num-badge">03</div>
            <h3>Open by Default</h3>
            <p>All core tools are open source. Knowledge and access should never be gatekept by cost, geography, or language.</p>
          </div>
        </div>
      </div>
    </section>
  </div>

  <div class="subpage" data-sub="team">
    <section class="section">
      <div class="section-inner">
        <div class="section-heading">
          <div class="section-eyebrow">Leadership</div>
          <h2 class="section-title">The people behind TEWW</h2>
          <p class="section-subtitle">Our leadership reflects the community we serve — half of our executive team is visually impaired, and every office is led by someone local to the region.</p>
        </div>

        <div class="team-grid">
          ${team.map(teamCard).join('') || '<p style="color:var(--fg-muted);">No team members yet.</p>'}
        </div>
      </div>
    </section>

    ${board.length ? `<section class="section section-alt">
      <div class="section-inner">
        <div class="section-heading left" style="max-width:720px;">
          <div class="section-eyebrow">Board of Directors</div>
          <h2 class="section-title">Governance and oversight</h2>
          <p class="section-subtitle">An expert board providing disability-rights, governance, and open-tech oversight.</p>
        </div>
        <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;">
          ${board.map(boardRow).join('')}
        </div>
      </div>
    </section>` : ''}
  </div>`;
}
