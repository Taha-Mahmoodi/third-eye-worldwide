import { visibleSorted } from '@/lib/cms/db';
import { esc, rich } from '@/lib/pages/_helpers';

function amountBtn(it, selectedIdx, idx) {
  const sel = idx === selectedIdx ? ' selected' : '';
  return `<button class="amount-btn${sel}" data-amount="${esc(it.amt || '')}" onclick="pickAmount(this)"><div class="amt">${esc(it.amt || '')}</div><div class="imp">${esc(it.imp || '')}</div></button>`;
}

function impactRow(it) {
  return `<div class="impact-row">
    <div class="impact-icon"><i class="ph ${esc(it.icon || 'ph-circle')}"></i></div>
    <div class="text"><strong>${esc(it.title || '')}</strong><span>${esc(it.desc || '')}</span></div>
  </div>`;
}

export function renderDonate(content) {
  const d = content?.donate || {};
  const monthly = visibleSorted(d.monthlyAmounts || []);
  const once = visibleSorted(d.onceAmounts || []);
  const impact = visibleSorted(d.impactBreakdown || []);

  return `
  <div class="page-hero">
    <div class="page-hero-inner">
      <div class="section-eyebrow">${esc(d.heroEyebrow || 'Give')}</div>
      <h1>${rich(d.heroTitle || 'Your gift opens worlds.')}</h1>
      ${d.heroSub ? `<p>${esc(d.heroSub)}</p>` : ''}
    </div>
  </div>

  <section class="section">
    <div class="section-inner">
      <div class="donate-grid">
        <div>
          <div class="donate-toggle" role="tablist" aria-label="Donation frequency">
            <button class="active" data-mode="monthly" onclick="setDonateMode('monthly')"><i class="ph ph-repeat"></i> <span class="t-label">Monthly</span></button>
            <button data-mode="once" onclick="setDonateMode('once')"><i class="ph ph-currency-dollar"></i> <span class="t-label">One-time</span></button>
          </div>

          <div data-donate-mode="monthly">
            <div class="amount-grid">
              ${monthly.map((it, i) => amountBtn(it, 1, i)).join('') || ''}
            </div>
            <div class="custom-amount">
              <span class="cur">$</span>
              <input id="custom-amount-input" type="text" placeholder="Custom amount">
              <span style="font-family:var(--font-display);font-size:.85rem;color:var(--fg-muted);">/ month</span>
            </div>
            <p style="font-size:.88rem;color:var(--fg-muted);margin-bottom:20px;line-height:1.55;"><i class="ph-fill ph-seal-check" style="color:var(--brand);"></i> &nbsp;Monthly donors join the <strong style="color:var(--fg);">Circle of Access</strong> — quarterly impact reports, early product access, and two community events per year.</p>
            <button type="button" class="btn-accent" data-donate-submit="monthly" style="width:100%;justify-content:center;font-size:1.05rem;padding:16px;"><i class="ph-fill ph-heart"></i> Donate Monthly</button>
          </div>

          <div data-donate-mode="once" style="display:none;">
            <div class="amount-grid">
              ${once.map((it, i) => amountBtn(it, 1, i)).join('') || ''}
            </div>
            <div class="custom-amount">
              <span class="cur">$</span>
              <input id="custom-amount-input-once" type="text" placeholder="Custom amount">
              <span style="font-family:var(--font-display);font-size:.85rem;color:var(--fg-muted);">once</span>
            </div>
            <p style="font-size:.88rem;color:var(--fg-muted);margin-bottom:20px;line-height:1.55;"><i class="ph-fill ph-gift" style="color:var(--accent);"></i> &nbsp;One-time gifts of $500+ can be directed to a specific program. Your gift is tax-deductible in the US, UK, Canada, and India.</p>
            <button type="button" class="btn-primary" data-donate-submit="once" style="width:100%;justify-content:center;font-size:1.05rem;padding:16px;"><i class="ph ph-currency-dollar"></i> Give Once</button>
          </div>

          <div style="margin-top:36px;">
            <h3 style="font-family:var(--font-display);font-size:1.15rem;font-weight:700;color:var(--fg);margin-bottom:16px;">Your details</h3>
            <div class="secure-note"><i class="ph-fill ph-lock-simple"></i> Submissions land in the TEWW admin inbox for follow-up. Connect Stripe to charge cards directly.</div>
            <div class="pay-row">
              <div class="pay-field"><label>First name</label><input type="text" id="donor-first" placeholder="Jane"></div>
              <div class="pay-field"><label>Last name</label><input type="text" id="donor-last" placeholder="Smith"></div>
            </div>
            <div class="pay-field"><label>Email for receipt</label><input type="email" id="donor-email" placeholder="you@example.com"></div>
            <div class="pay-field"><label>Note (optional)</label><input type="text" id="donor-note" placeholder="Direct my gift to a specific program"></div>
            <div id="donate-status" aria-live="polite" style="margin-top:10px;font-size:.9rem;color:var(--fg-muted);"></div>
          </div>
        </div>

        <div style="position:sticky;top:140px;">
          <div class="donate-impact">
            <div style="font-family:var(--font-display);font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:10px;">Your Impact</div>
            <h3>Where your gift goes</h3>
            <p class="lead">Every donation is tracked to a specific program. We publish quarterly impact reports showing exactly how funds are deployed.</p>
            ${impact.map(impactRow).join('') || ''}
          </div>

          <div style="background:var(--bg-subtle);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px;margin-top:20px;">
            <div style="font-family:var(--font-display);font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--brand);margin-bottom:10px;">Other Ways to Give</div>
            <div style="display:flex;flex-direction:column;gap:12px;">
              <a href="#" style="display:flex;align-items:center;gap:10px;color:var(--fg);font-family:var(--font-display);font-size:.92rem;font-weight:500;"><i class="ph ph-bank" style="color:var(--brand);font-size:18px;"></i> Bank transfer / wire</a>
              <a href="#" style="display:flex;align-items:center;gap:10px;color:var(--fg);font-family:var(--font-display);font-size:.92rem;font-weight:500;"><i class="ph ph-chart-line-up" style="color:var(--brand);font-size:18px;"></i> Donate stock or crypto</a>
              <a href="#" style="display:flex;align-items:center;gap:10px;color:var(--fg);font-family:var(--font-display);font-size:.92rem;font-weight:500;"><i class="ph ph-briefcase" style="color:var(--brand);font-size:18px;"></i> Employer matching</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <script>
  (function() {
    function parseAmount(str) {
      if (!str) return 0;
      const num = Number(String(str).replace(/[^0-9.]/g, ''));
      return isNaN(num) ? 0 : num;
    }
    function setStatus(msg, ok) {
      const el = document.getElementById('donate-status');
      if (el) { el.textContent = msg; el.style.color = ok === false ? 'var(--accent)' : 'var(--fg-muted)'; }
    }
    document.querySelectorAll('[data-donate-submit]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const mode = btn.getAttribute('data-donate-submit');
        const selected = document.querySelector('[data-donate-mode="' + mode + '"] .amount-btn.selected');
        const customId = mode === 'once' ? 'custom-amount-input-once' : 'custom-amount-input';
        const customVal = parseAmount(document.getElementById(customId)?.value);
        const selectedVal = parseAmount(selected?.dataset.amount);
        const amount = customVal || selectedVal;
        const first = document.getElementById('donor-first')?.value?.trim() || '';
        const last = document.getElementById('donor-last')?.value?.trim() || '';
        const email = document.getElementById('donor-email')?.value?.trim() || '';
        const note = document.getElementById('donor-note')?.value?.trim() || '';
        if (!first || !last) { setStatus('Please enter your name.', false); return; }
        if (!email || !/\\S+@\\S+\\.\\S+/.test(email)) { setStatus('Please enter a valid email.', false); return; }
        if (!amount) { setStatus('Please pick or enter an amount.', false); return; }
        setStatus('Submitting…');
        try {
          const r = await fetch('/api/cms/submissions/donation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: (first + ' ' + last).trim(), email, amount, mode, note }),
          });
          if (!r.ok) throw new Error('HTTP ' + r.status);
          setStatus('Thank you — we\\'ll be in touch shortly.');
        } catch (e) {
          setStatus('Could not submit: ' + e.message, false);
        }
      });
    });
  })();
  </script>

  <section class="section section-alt">
    <div class="section-inner">
      <div class="section-heading">
        <div class="section-eyebrow">Transparency</div>
        <h2 class="section-title">Every dollar is accounted for</h2>
        <p class="section-subtitle">Audited annually. Published publicly. Available in accessible formats on request.</p>
      </div>
      <div class="feature-grid">
        <div class="feature-card"><div class="feature-icon"><i class="ph ph-file-text"></i></div><h3>Annual reports</h3><p>Detailed financial and program reports published every March — available since our founding in 2025.</p><a class="card-link" href="#">View reports <i class="ph ph-arrow-right"></i></a></div>
        <div class="feature-card"><div class="feature-icon"><i class="ph ph-check-circle"></i></div><h3>Third-party audited</h3><p>Independently audited by Baker Tilly. Charity Navigator 4-star. GuideStar Platinum Seal 2025-2026.</p><a class="card-link" href="#">See audits <i class="ph ph-arrow-right"></i></a></div>
        <div class="feature-card"><div class="feature-icon"><i class="ph ph-shield-check"></i></div><h3>Donor privacy</h3><p>We never sell, rent, or share donor information. Full anonymity available on request.</p><a class="card-link" href="#">Privacy policy <i class="ph ph-arrow-right"></i></a></div>
      </div>
    </div>
  </section>`;
}
