import { visibleSorted } from '@/lib/cms/db';

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

// Dynamic renderer — builds the projects page from CMS content.
// Accepts the full CMS content object; reads `projects` section,
// with a fallback to the legacy `programs` key for backward-compat
// with CMS data seeded before the Programs → Projects rename.
export function renderProjects(content) {
  const p = content?.projects || content?.programs || {};
  const items = visibleSorted(p.items || []);

  const heroEyebrow = escapeHtml(p.heroEyebrow || 'Projects');
  // heroTitle + heroSub may contain editor-authored HTML (e.g. <em>) — trust the CMS output here.
  const heroTitle = p.heroTitle || 'Our projects.';
  const heroSub = p.heroSub || '';

  const ctaHeading = escapeHtml(p.ctaHeading || 'Support a project.');
  const ctaSub = escapeHtml(p.ctaSub || "Every project is funded by people like you. Pick one to sponsor, or let us direct your gift to where it's needed most.");

  const cards = items.map((it) => `
    <div class="prog-card">
      <div class="prog-icon"><i class="ph ${escapeHtml(it.icon || 'ph-star')}"></i></div>
      <div class="prog-content">
        <h3>${escapeHtml(it.title || '')}</h3>
        <p>${escapeHtml(it.desc || '')}</p>
        ${it.tag ? `<span class="prog-tag">${escapeHtml(it.tag)}</span>` : ''}
      </div>
    </div>
  `).join('');

  return `
  <div class="page-hero">
    <div class="page-hero-inner">
      <div class="section-eyebrow">${heroEyebrow}</div>
      <h1>${heroTitle}</h1>
      ${heroSub ? `<p>${heroSub}</p>` : ''}
    </div>
  </div>

  <section class="section">
    <div class="section-inner">
      <div class="prog-grid">
        ${cards || '<p style="grid-column:1/-1;color:var(--fg-muted);">No projects to show yet.</p>'}
      </div>
    </div>
  </section>

  <section class="cta-band">
    <div class="cta-inner">
      <h2>${ctaHeading}</h2>
      <p>${ctaSub}</p>
      <div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;">
        <button class="btn-accent" onclick="goto('donate')"><i class="ph-fill ph-heart"></i> Donate Now</button>
        <button class="btn-secondary" onclick="goto('volunteers')">Volunteer</button>
      </div>
    </div>
  </section>`;
}
