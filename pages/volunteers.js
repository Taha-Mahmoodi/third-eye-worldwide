function renderVolunteers() {
  return `
  <div class="page-hero">
    <div class="page-hero-inner">
      <div class="section-eyebrow">Volunteer</div>
      <h1>Lend your <em>skills.</em></h1>
      <p>Our work happens because 800+ volunteers around the world give what they can — an hour, an afternoon, a pull request. Here's where to start.</p>
    </div>
  </div>

  <section class="section">
    <div class="section-inner">
      <div class="vol-stat-grid">
        <div class="about-stat"><div class="n">820+</div><div class="l">Active volunteers</div></div>
        <div class="about-stat"><div class="n">62</div><div class="l">Countries</div></div>
        <div class="about-stat"><div class="n">40+</div><div class="l">Languages supported</div></div>
        <div class="about-stat"><div class="n">1–4</div><div class="l">Hours / week commitment</div></div>
      </div>

      <div class="section-heading left" style="max-width:720px;">
        <div class="section-eyebrow">Open Roles</div>
        <h2 class="section-title">Find a role that fits</h2>
        <p class="section-subtitle">Every role is remote-friendly, self-paced, and paired with a mentor. No experience with accessibility is required for most positions.</p>
      </div>

      <div class="role-grid">
        ${role('ph-translate','Translator','Localise our interfaces, docs, and audio scripts into your language.','Language fluency','2–4 hrs/wk')}
        ${role('ph-code','Open-source contributor','Write and review code for our Screen Reader, Magnifier, and Navigation apps.','JavaScript / Swift / Kotlin','Flexible')}
        ${role('ph-microphone','Audio narrator','Record human voice-overs for our Audiolibrary. Every voice counts.','Clear speaking voice','1–3 hrs/wk')}
        ${role('ph-chalkboard-teacher','Training facilitator','Lead our 4-week digital literacy bootcamps, in-person or virtual.','Teaching experience','6–8 hrs/wk')}
        ${role('ph-magnifying-glass','Accessibility tester','Help test new releases. Guided sessions — no prior testing experience needed.','Screen reader user preferred','1 hr / release')}
        ${role('ph-users-three','Community organiser','Build a local TEWW chapter. Host events, workshops, and recruitment.','Leadership / hosting','4–6 hrs/wk')}
        ${role('ph-pencil-line','Writer &amp; editor','Contribute to our blog, stories, and grant applications.','Strong writing','Flexible')}
        ${role('ph-camera','Photographer / videographer','Document field work — stories, events, training days. With consent.','Portfolio / camera','Event-based')}
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
            <div class="vol-step"><div><h4>Apply</h4><p>Fill out a short form. It takes 6 minutes. We read every application within 48 hours.</p></div></div>
            <div class="vol-step"><div><h4>Orientation call</h4><p>A 30-minute video or phone call with a program coordinator to match you to the right role.</p></div></div>
            <div class="vol-step"><div><h4>Onboarding</h4><p>Self-paced training, plus a live kickoff session with other new volunteers in your region.</p></div></div>
            <div class="vol-step"><div><h4>Meet your mentor</h4><p>Every volunteer is paired with an experienced mentor for their first three months.</p></div></div>
            <div class="vol-step"><div><h4>Start contributing</h4><p>First task, first translation, first code review — whatever your role, you're shipping in week two.</p></div></div>
          </div>
        </div>
        <div class="vol-form">
          <h3>Apply to volunteer</h3>
          <div class="pay-row">
            <div class="pay-field"><label>First name</label><input type="text" placeholder="Jane"></div>
            <div class="pay-field"><label>Last name</label><input type="text" placeholder="Smith"></div>
          </div>
          <div class="pay-field"><label>Email</label><input type="email" placeholder="you@example.com"></div>
          <div class="pay-field"><label>Country / time zone</label><input type="text" placeholder="e.g. Lagos, WAT (UTC+1)"></div>
          <div class="pay-field">
            <label>Preferred roles (pick all that apply)</label>
            <div class="checkbox-grid" style="margin-top:4px;">
              <label class="cb-pill"><input type="checkbox"> Translator</label>
              <label class="cb-pill"><input type="checkbox"> Open-source</label>
              <label class="cb-pill"><input type="checkbox"> Narrator</label>
              <label class="cb-pill"><input type="checkbox"> Facilitator</label>
              <label class="cb-pill"><input type="checkbox"> Tester</label>
              <label class="cb-pill"><input type="checkbox"> Organiser</label>
              <label class="cb-pill"><input type="checkbox"> Writer</label>
              <label class="cb-pill"><input type="checkbox"> Photographer</label>
            </div>
          </div>
          <div class="pay-field">
            <label>Hours per week you can commit</label>
            <select><option>1–2 hours</option><option>3–5 hours</option><option>6–10 hours</option><option>10+ hours</option></select>
          </div>
          <div class="pay-field">
            <label>Tell us about yourself (optional)</label>
            <textarea rows="3" style="font-family:var(--font-body);font-size:.95rem;color:var(--fg);background:var(--bg);border:1.5px solid var(--border);border-radius:var(--radius-md);padding:11px 14px;outline:none;resize:none;" placeholder="A few sentences about your interests and why TEWW…"></textarea>
          </div>
          <button class="btn-primary" style="width:100%;justify-content:center;"><i class="ph ph-paper-plane-tilt"></i> Submit Application</button>
          <p style="font-size:.78rem;color:var(--fg-muted);margin-top:12px;line-height:1.5;text-align:center;">We accept applications from anywhere. Applications are reviewed in the order received.</p>
        </div>
      </div>
    </div>
  </section>

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

function role(icon, title, desc, tag1, tag2) {
  return `<div class="role-card">
    <div class="role-icon"><i class="ph ${icon}"></i></div>
    <h4>${title}</h4>
    <p>${desc}</p>
    <div class="role-tags"><span class="role-tag">${tag1}</span><span class="role-tag">${tag2}</span></div>
  </div>`;
}
