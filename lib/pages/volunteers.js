import { visibleSorted } from '@/lib/cms/db';

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}
function rich(s) { return s == null ? '' : String(s); }

function statCell(it) {
  return `<div class="about-stat"><div class="n">${rich(it.number || '')}</div><div class="l">${esc(it.label || '')}</div></div>`;
}

function roleCard(it) {
  return `<div class="role-card">
    <div class="role-icon"><i class="ph ${esc(it.icon || 'ph-hand-heart')}"></i></div>
    <h4>${esc(it.title || '')}</h4>
    <p>${esc(it.desc || '')}</p>
    <div class="role-tags">
      ${it.tag1 ? `<span class="role-tag">${esc(it.tag1)}</span>` : ''}
      ${it.tag2 ? `<span class="role-tag">${esc(it.tag2)}</span>` : ''}
    </div>
  </div>`;
}

function stepItem(it) {
  return `<div class="vol-step"><div><h4>${esc(it.title || '')}</h4><p>${esc(it.desc || '')}</p></div></div>`;
}

export function renderVolunteers(content) {
  const v = content?.volunteers || {};
  const stats = visibleSorted(v.stats || []);
  const roles = visibleSorted(v.roles || []);
  const steps = visibleSorted(v.steps || []);

  return `
  <div class="page-hero">
    <div class="page-hero-inner">
      <div class="section-eyebrow">${esc(v.heroEyebrow || 'Volunteer')}</div>
      <h1>${rich(v.heroTitle || 'Lend your skills.')}</h1>
      ${v.heroSub ? `<p>${esc(v.heroSub)}</p>` : ''}
    </div>
  </div>

  <section class="section">
    <div class="section-inner">
      ${stats.length ? `<div class="vol-stat-grid">${stats.map(statCell).join('')}</div>` : ''}

      <div class="section-heading left" style="max-width:720px;">
        <div class="section-eyebrow">Open Roles</div>
        <h2 class="section-title">Find a role that fits</h2>
        <p class="section-subtitle">Every role is remote-friendly, self-paced, and paired with a mentor.</p>
      </div>

      <div class="role-grid">
        ${roles.map(roleCard).join('') || '<p style="color:var(--fg-muted);">No roles listed yet.</p>'}
      </div>
    </div>
  </section>

  <section class="section section-alt">
    <div class="section-inner">
      <div class="vol-split">
        <div>
          <div class="section-eyebrow">How It Works</div>
          <h2 style="font-family:var(--font-display);font-size:clamp(1.75rem,2.8vw,2.5rem);font-weight:700;color:var(--fg);margin-bottom:24px;letter-spacing:-.03em;line-height:1.1;">From application to first contribution in under two weeks.</h2>
          <div class="vol-steps">
            ${steps.map(stepItem).join('') || ''}
          </div>
        </div>
        <div class="vol-form">
          <h3>Apply to volunteer</h3>
          <div class="pay-row">
            <div class="pay-field"><label>First name</label><input type="text" id="vol-first" placeholder="Jane"></div>
            <div class="pay-field"><label>Last name</label><input type="text" id="vol-last" placeholder="Smith"></div>
          </div>
          <div class="pay-field"><label>Email</label><input type="email" id="vol-email" placeholder="you@example.com"></div>
          <div class="pay-field"><label>Country / time zone</label><input type="text" id="vol-country" placeholder="e.g. Lagos, WAT (UTC+1)"></div>
          <div class="pay-field">
            <label>Preferred roles (pick all that apply)</label>
            <div class="checkbox-grid" id="vol-roles" style="margin-top:4px;">
              ${roles.map((r) => `<label class="cb-pill"><input type="checkbox" value="${esc(r.title || '')}"> ${esc(r.title || '')}</label>`).join('')}
            </div>
          </div>
          <div class="pay-field">
            <label>Hours per week you can commit</label>
            <select id="vol-hours"><option>1–2 hours</option><option>3–5 hours</option><option>6–10 hours</option><option>10+ hours</option></select>
          </div>
          <div class="pay-field">
            <label>Tell us about yourself (optional)</label>
            <textarea id="vol-message" rows="3" style="font-family:var(--font-body);font-size:.95rem;color:var(--fg);background:var(--bg);border:1.5px solid var(--border);border-radius:var(--radius-md);padding:11px 14px;outline:none;resize:none;" placeholder="A few sentences about your interests and why TEWW…"></textarea>
          </div>
          <button type="button" id="vol-submit" class="btn-primary" style="width:100%;justify-content:center;"><i class="ph ph-paper-plane-tilt"></i> Submit Application</button>
          <p id="vol-status" aria-live="polite" style="font-size:.85rem;color:var(--fg-muted);margin-top:12px;line-height:1.5;text-align:center;">We accept applications from anywhere. Reviewed in the order received.</p>
        </div>
      </div>
    </div>
  </section>

  <script>
  (function () {
    const btn = document.getElementById('vol-submit');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const first = document.getElementById('vol-first')?.value?.trim() || '';
      const last = document.getElementById('vol-last')?.value?.trim() || '';
      const email = document.getElementById('vol-email')?.value?.trim() || '';
      const country = document.getElementById('vol-country')?.value?.trim() || '';
      const hours = document.getElementById('vol-hours')?.value || '';
      const message = document.getElementById('vol-message')?.value?.trim() || '';
      const chosenRoles = [...document.querySelectorAll('#vol-roles input:checked')].map((el) => el.value);
      const status = document.getElementById('vol-status');
      function set(msg, ok) { if (status) { status.textContent = msg; status.style.color = ok === false ? 'var(--accent)' : 'var(--fg-muted)'; } }
      if (!first || !last) { set('Please enter your name.', false); return; }
      if (!email || !/\\S+@\\S+\\.\\S+/.test(email)) { set('Please enter a valid email.', false); return; }
      set('Submitting…');
      try {
        const r = await fetch('/api/cms/submissions/volunteer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: (first + ' ' + last).trim(),
            email,
            role: chosenRoles.join(', ') || null,
            skills: [country, hours].filter(Boolean).join(' · ') || null,
            message: message || null,
          }),
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        set('Thank you — we read every application within 48 hours.');
      } catch (e) {
        set('Could not submit: ' + e.message, false);
      }
    });
  })();
  </script>

  <section class="cta-band">
    <div class="cta-inner">
      <h2>Not sure where you fit?</h2>
      <p>Join one of our monthly drop-in calls. Meet existing volunteers, ask questions, no commitment.</p>
      <div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;">
        <button class="btn-accent"><i class="ph ph-calendar-plus"></i> Book a Drop-in</button>
        <button class="btn-secondary" onclick="goto('donate')">Donate Instead</button>
      </div>
    </div>
  </section>`;
}
