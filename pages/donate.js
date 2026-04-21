function renderDonate() {
  return `
  <div class="page-hero">
    <div class="page-hero-inner">
      <div class="section-eyebrow">Give</div>
      <h1>Your gift <em>opens worlds.</em></h1>
      <p>Every dollar funds free tools, free training, and free devices for visually impaired people worldwide. 94¢ of every dollar goes directly to programs.</p>
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

          <!-- Monthly -->
          <div data-donate-mode="monthly">
            <div class="amount-grid">
              <button class="amount-btn" onclick="pickAmount(this)"><div class="amt">$10</div><div class="imp">1 user / year</div></button>
              <button class="amount-btn selected" onclick="pickAmount(this)"><div class="amt">$25</div><div class="imp">3 users / year</div></button>
              <button class="amount-btn" onclick="pickAmount(this)"><div class="amt">$50</div><div class="imp">1 device funded</div></button>
              <button class="amount-btn" onclick="pickAmount(this)"><div class="amt">$100</div><div class="imp">1 scholarship / mo</div></button>
              <button class="amount-btn" onclick="pickAmount(this)"><div class="amt">$250</div><div class="imp">Training cohort</div></button>
              <button class="amount-btn" onclick="pickAmount(this)"><div class="amt">$500</div><div class="imp">Translator funded</div></button>
            </div>
            <div class="custom-amount">
              <span class="cur">$</span>
              <input id="custom-amount-input" type="text" placeholder="Custom amount">
              <span style="font-family:var(--font-display);font-size:.85rem;color:var(--fg-muted);">/ month</span>
            </div>
            <p style="font-size:.88rem;color:var(--fg-muted);margin-bottom:20px;line-height:1.55;"><i class="ph-fill ph-seal-check" style="color:var(--brand);"></i> &nbsp;Monthly donors join the <strong style="color:var(--fg);">Circle of Access</strong> — quarterly impact reports, early product access, and two community events per year.</p>
            <button class="btn-accent" style="width:100%;justify-content:center;font-size:1.05rem;padding:16px;"><i class="ph-fill ph-heart"></i> Donate Monthly</button>
          </div>

          <!-- One-time -->
          <div data-donate-mode="once" style="display:none;">
            <div class="amount-grid">
              <button class="amount-btn" onclick="pickAmount(this)"><div class="amt">$50</div><div class="imp">1 full training</div></button>
              <button class="amount-btn selected" onclick="pickAmount(this)"><div class="amt">$100</div><div class="imp">2 devices funded</div></button>
              <button class="amount-btn" onclick="pickAmount(this)"><div class="amt">$250</div><div class="imp">Full cohort sponsored</div></button>
              <button class="amount-btn" onclick="pickAmount(this)"><div class="amt">$500</div><div class="imp">Local field trip</div></button>
              <button class="amount-btn" onclick="pickAmount(this)"><div class="amt">$1,000</div><div class="imp">Grant co-funded</div></button>
              <button class="amount-btn" onclick="pickAmount(this)"><div class="amt">$5,000</div><div class="imp">Major donor</div></button>
            </div>
            <div class="custom-amount">
              <span class="cur">$</span>
              <input id="custom-amount-input-once" type="text" placeholder="Custom amount">
              <span style="font-family:var(--font-display);font-size:.85rem;color:var(--fg-muted);">once</span>
            </div>
            <p style="font-size:.88rem;color:var(--fg-muted);margin-bottom:20px;line-height:1.55;"><i class="ph-fill ph-gift" style="color:var(--accent);"></i> &nbsp;One-time gifts of $500+ can be directed to a specific program. Your gift is tax-deductible in the US, UK, Canada, and India.</p>
            <button class="btn-primary" style="width:100%;justify-content:center;font-size:1.05rem;padding:16px;"><i class="ph ph-currency-dollar"></i> Give Once</button>
          </div>

          <!-- Payment details -->
          <div style="margin-top:36px;">
            <h3 style="font-family:var(--font-display);font-size:1.15rem;font-weight:700;color:var(--fg);margin-bottom:16px;">Payment details</h3>
            <div class="secure-note"><i class="ph-fill ph-lock-simple"></i> 256-bit SSL encrypted · PCI DSS compliant · Never stored on our servers</div>
            <div class="pay-row">
              <div class="pay-field"><label>First name</label><input type="text" placeholder="Jane"></div>
              <div class="pay-field"><label>Last name</label><input type="text" placeholder="Smith"></div>
            </div>
            <div class="pay-field"><label>Email for receipt</label><input type="email" placeholder="you@example.com"></div>
            <div class="pay-field"><label>Card number</label><input type="text" placeholder="•••• •••• •••• ••••" autocomplete="cc-number"></div>
            <div class="pay-row">
              <div class="pay-field"><label>Expiry</label><input type="text" placeholder="MM / YY"></div>
              <div class="pay-field"><label>CVC</label><input type="text" placeholder="•••"></div>
            </div>
            <div class="pay-field">
              <label>Country</label>
              <select><option>United States</option><option>United Kingdom</option><option>Canada</option><option>India</option><option>Other</option></select>
            </div>
            <div style="display:flex;gap:10px;padding:14px;background:var(--brand-subtle);border-radius:var(--radius-md);align-items:flex-start;">
              <input type="checkbox" id="cover-fees" style="margin-top:3px;accent-color:var(--brand);">
              <label for="cover-fees" style="font-size:.88rem;color:var(--fg);line-height:1.5;font-family:var(--font-body);"><strong style="font-family:var(--font-display);">Cover transaction fees</strong> so 100% of your donation reaches our programs. Adds ~3% to your total.</label>
            </div>
          </div>
        </div>

        <div style="position:sticky;top:140px;">
          <div class="donate-impact">
            <div style="font-family:var(--font-display);font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:10px;">Your Impact</div>
            <h3>Where your gift goes</h3>
            <p class="lead">Every donation is tracked to a specific program. We publish quarterly impact reports showing exactly how funds are deployed.</p>
            <div class="impact-row">
              <div class="impact-icon"><i class="ph ph-speaker-high"></i></div>
              <div class="text"><strong>Free tools &amp; software</strong><span>40% · Maintains our screen reader, magnifier, and navigation apps</span></div>
            </div>
            <div class="impact-row">
              <div class="impact-icon"><i class="ph ph-chalkboard-teacher"></i></div>
              <div class="text"><strong>Training programs</strong><span>28% · Four-week bootcamps and one-on-one sessions</span></div>
            </div>
            <div class="impact-row">
              <div class="impact-icon"><i class="ph ph-device-mobile"></i></div>
              <div class="text"><strong>Device distribution</strong><span>18% · Pre-configured smartphones for underserved users</span></div>
            </div>
            <div class="impact-row">
              <div class="impact-icon"><i class="ph ph-graduation-cap"></i></div>
              <div class="text"><strong>Scholarships &amp; grants</strong><span>8% · STEM and design scholarships for blind students</span></div>
            </div>
            <div class="impact-row">
              <div class="impact-icon"><i class="ph ph-gear"></i></div>
              <div class="text"><strong>Operations</strong><span>6% · Audited annually · 94¢/dollar to programs</span></div>
            </div>
          </div>

          <div style="background:var(--bg-subtle);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px;margin-top:20px;">
            <div style="font-family:var(--font-display);font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--brand);margin-bottom:10px;">Other Ways to Give</div>
            <div style="display:flex;flex-direction:column;gap:12px;">
              <a href="#" style="display:flex;align-items:center;gap:10px;color:var(--fg);font-family:var(--font-display);font-size:.92rem;font-weight:500;"><i class="ph ph-bank" style="color:var(--brand);font-size:18px;"></i> Bank transfer / wire</a>
              <a href="#" style="display:flex;align-items:center;gap:10px;color:var(--fg);font-family:var(--font-display);font-size:.92rem;font-weight:500;"><i class="ph ph-chart-line-up" style="color:var(--brand);font-size:18px;"></i> Donate stock or crypto</a>
              <a href="#" style="display:flex;align-items:center;gap:10px;color:var(--fg);font-family:var(--font-display);font-size:.92rem;font-weight:500;"><i class="ph ph-briefcase" style="color:var(--brand);font-size:18px;"></i> Employer matching</a>
              <a href="#" style="display:flex;align-items:center;gap:10px;color:var(--fg);font-family:var(--font-display);font-size:.92rem;font-weight:500;"><i class="ph ph-scroll" style="color:var(--brand);font-size:18px;"></i> Planned giving / bequest</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

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
