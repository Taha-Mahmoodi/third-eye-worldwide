function renderAbout() {
  return `
  <style>
    .faq-wrap {
      max-width: 880px;
      margin: 0 auto;
      padding: 0 var(--space-8);
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .faq-intro-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: end;
      margin-bottom: 48px;
      padding-bottom: 32px;
      border-bottom: 1px solid var(--border);
    }
    .faq-intro-row h2 {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: clamp(1.9rem, 3.2vw, 2.6rem);
      letter-spacing: -.035em;
      line-height: 1.1;
      color: var(--fg);
      text-wrap: balance;
    }
    .faq-intro-row h2 em {
      font-style: normal;
      color: var(--brand);
    }
    .faq-intro-row p {
      font-size: 1.02rem;
      color: var(--fg-muted);
      line-height: 1.65;
    }
    .faq-counter {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: .72rem;
      letter-spacing: .2em;
      text-transform: uppercase;
      color: var(--fg-subtle);
      margin-bottom: 10px;
      display: block;
    }

    details.faq-item {
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--bg-elevated);
      overflow: hidden;
      transition: border-color .25s, box-shadow .25s;
    }
    details.faq-item[open] {
      border-color: var(--border-strong);
      box-shadow: var(--shadow-sm);
    }
    details.faq-item:hover:not([open]) {
      border-color: var(--border-strong);
    }
    details.faq-item > summary {
      list-style: none;
      cursor: pointer;
      padding: 28px 32px;
      display: grid;
      grid-template-columns: 56px 1fr 40px;
      align-items: center;
      gap: 20px;
      outline: none;
    }
    details.faq-item > summary::-webkit-details-marker { display: none; }
    .faq-num {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: .78rem;
      letter-spacing: .14em;
      color: var(--fg-subtle);
      border: 1px solid var(--border);
      padding: 8px 10px;
      border-radius: 10px;
      text-align: center;
      transition: color .2s, border-color .2s, background .2s;
    }
    details.faq-item[open] .faq-num {
      color: var(--brand);
      border-color: var(--brand);
      background: var(--brand-subtle);
    }
    .faq-q {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: clamp(1.15rem, 1.6vw, 1.4rem);
      letter-spacing: -.02em;
      line-height: 1.25;
      color: var(--fg);
      text-wrap: balance;
    }
    .faq-q em {
      font-style: italic;
      font-weight: 600;
      color: var(--accent);
    }
    .faq-chev {
      width: 40px; height: 40px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: var(--bg-subtle);
      color: var(--fg-muted);
      border: 1px solid var(--border);
      transition: transform .3s ease, background .2s, color .2s;
      font-size: 16px;
    }
    details.faq-item[open] .faq-chev {
      transform: rotate(45deg);
      background: var(--brand);
      color: white;
      border-color: var(--brand);
    }

    .faq-panel {
      padding: 4px 32px 34px 108px;
      border-top: 1px dashed var(--border);
      margin-top: 0;
      animation: faqFade .35s ease;
    }
    @keyframes faqFade {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .faq-panel > p + p { margin-top: 14px; }
    .faq-panel p {
      font-size: 1rem;
      line-height: 1.72;
      color: var(--fg-muted);
      max-width: 62ch;
    }
    .faq-panel p strong {
      color: var(--fg);
      font-weight: 600;
    }
    .faq-panel ul {
      list-style: none;
      padding: 0;
      margin: 18px 0 6px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .faq-panel li {
      font-size: .98rem;
      color: var(--fg-muted);
      line-height: 1.55;
      padding-left: 24px;
      position: relative;
    }
    .faq-panel li::before {
      content: '';
      position: absolute;
      left: 0; top: 10px;
      width: 14px; height: 2px;
      background: var(--accent);
    }
    .faq-panel li strong {
      color: var(--fg); font-weight: 600;
    }
    .faq-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 22px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
    }
    .faq-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 999px;
      font-family: var(--font-display);
      font-size: .78rem;
      font-weight: 600;
      color: var(--fg);
    }
    .faq-chip i { color: var(--brand); font-size: 14px; }
    .faq-chip.accent i { color: var(--accent); }

    .faq-cta {
      margin-top: 56px;
      padding: 40px 44px;
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--bg-elevated);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
    }
    .faq-cta h3 {
      font-family: var(--font-display);
      font-size: 1.3rem;
      font-weight: 700;
      letter-spacing: -.02em;
      color: var(--fg);
      margin-bottom: 6px;
    }
    .faq-cta p {
      font-size: .94rem;
      color: var(--fg-muted);
    }
    .faq-cta-btns {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    @media (max-width: 720px) {
      .faq-intro-row { grid-template-columns: 1fr; gap: 18px; }
      details.faq-item > summary {
        padding: 22px 20px;
        grid-template-columns: 44px 1fr 32px;
        gap: 14px;
      }
      .faq-panel { padding: 4px 22px 26px 22px; }
      .faq-chev { width: 32px; height: 32px; }
      .faq-cta { padding: 28px 24px; }
    }
  </style>

  <div class="page-hero">
    <div class="page-hero-inner">
      <div class="section-eyebrow">About Us</div>
      <h1>The answers, <em>up front.</em></h1>
      <p>Five honest questions about Third Eye Worldwide — who we are, what we do, what we stand for, and why we think you should come build with us.</p>
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
          <span class="faq-counter">5 Questions · 5 Answers</span>
          <h2>Everything you'd want to ask on <em>day one.</em></h2>
        </div>
        <p>Tap any question to expand. No marketing fluff — just the things people actually ask us in interviews, partner meetings, and donor calls.</p>
      </div>

      <details class="faq-item">
        <summary>
          <div class="faq-num">01</div>
          <div class="faq-q">Who <em>are</em> we?</div>
          <div class="faq-chev"><i class="ph-bold ph-plus"></i></div>
        </summary>
        <div class="faq-panel">
          <p><strong>Third Eye Worldwide (TEWW)</strong> is a registered non-profit technology NGO, founded in Mumbai in 2025 by two engineers — one sighted, one blind — who believed the tools available to visually impaired users were decades behind what was possible.</p>
          <p>Today we're a team of 120 full-time staff and 800+ active volunteers, operating across 47 countries from regional offices in Mumbai, Nairobi, São Paulo, Mexico City, Manila, Cairo, Dakar, and Jakarta. Half of our staff and leadership live with visual impairment — nothing is built about us, without us.</p>
          <div class="faq-stats">
            <span class="faq-chip"><i class="ph-fill ph-buildings"></i> 8 regional offices</span>
            <span class="faq-chip accent"><i class="ph-fill ph-users-three"></i> 50% representation</span>
            <span class="faq-chip"><i class="ph-fill ph-globe-hemisphere-east"></i> 47 countries</span>
          </div>
        </div>
      </details>

      <details class="faq-item">
        <summary>
          <div class="faq-num">02</div>
          <div class="faq-q">What do we <em>do?</em></div>
          <div class="faq-chev"><i class="ph-bold ph-plus"></i></div>
        </summary>
        <div class="faq-panel">
          <p>We build, distribute, and teach <strong>assistive technology</strong> — all of it free, all of it open source. Our core work falls into four buckets:</p>
          <ul>
            <li><strong>Software.</strong> Screen reader, visual magnifier, navigation aid, and an audio workbench — localised in 41 languages, tuned for 2G networks and five-year-old devices.</li>
            <li><strong>Hardware.</strong> The Device Lending Library has placed 18,000+ pre-configured smartphones with users who can't afford one.</li>
            <li><strong>Training.</strong> Digital literacy workshops for visually impaired individuals and the teachers, parents, and employers around them.</li>
            <li><strong>Research &amp; advocacy.</strong> Field studies, WCAG contributions, and policy work that makes the whole ecosystem better.</li>
          </ul>
        </div>
      </details>

      <details class="faq-item">
        <summary>
          <div class="faq-num">03</div>
          <div class="faq-q">Our <em>mission.</em></div>
          <div class="faq-chev"><i class="ph-bold ph-plus"></i></div>
        </summary>
        <div class="faq-panel">
          <p>To give every visually impaired person on earth <strong>full, independent, dignified access</strong> to the digital world — at no cost, in their own language, on whatever device they already own.</p>
          <p>We measure this mission in three ways: the number of people who gain a capability they didn't have yesterday, the share of our tools that remain free and open forever, and the percentage of users who say our software feels like it was built <em>for them</em>, not adapted to them.</p>
          <div class="faq-stats">
            <span class="faq-chip"><i class="ph-fill ph-heart"></i> 1.2M active users</span>
            <span class="faq-chip accent"><i class="ph-fill ph-code"></i> MIT licensed forever</span>
            <span class="faq-chip"><i class="ph-fill ph-currency-circle-dollar"></i> $0 for end users</span>
          </div>
        </div>
      </details>

      <details class="faq-item">
        <summary>
          <div class="faq-num">04</div>
          <div class="faq-q">Our <em>values?</em></div>
          <div class="faq-chev"><i class="ph-bold ph-plus"></i></div>
        </summary>
        <div class="faq-panel">
          <p>Five non-negotiables. Every hire, product decision, and partnership gets measured against them:</p>
          <ul>
            <li><strong>Dignity first.</strong> Accessibility isn't a feature we bolt on — it's the foundation we start from.</li>
            <li><strong>Nothing about us, without us.</strong> No product, policy, or program is designed without the people it serves in the room.</li>
            <li><strong>Open by default.</strong> MIT-licensed code, crowd-sourced translations, public research.</li>
            <li><strong>Built for where people live.</strong> If it only works in a San Francisco lab, it doesn't work.</li>
            <li><strong>Radical transparency.</strong> Every dollar is traceable, every impact number auditable, every mistake we make is published.</li>
          </ul>
        </div>
      </details>

      <details class="faq-item">
        <summary>
          <div class="faq-num">05</div>
          <div class="faq-q">Why should you <em>join us?</em></div>
          <div class="faq-chev"><i class="ph-bold ph-plus"></i></div>
        </summary>
        <div class="faq-panel">
          <p>Because the work is <strong>unambiguous, measurable, and personal</strong>. Every feature you ship, every language you translate, every device you configure ends up in the hands of a real person who gains independence they didn't have before.</p>
          <ul>
            <li><strong>You'll have ownership.</strong> Small teams, big mandates. Engineers ship to production in week one; program leads run regional strategy.</li>
            <li><strong>You'll work with experts by experience.</strong> Half your colleagues navigate the tools we build every day as users.</li>
            <li><strong>Your work stays free.</strong> Everything you build is MIT-licensed forever. No acquisitions, no paywalls, no "pro tier" someday.</li>
            <li><strong>You'll get paid fairly.</strong> Transparent salary bands, pegged to local cost of living — benchmarked to the 75th percentile of non-profit tech.</li>
          </ul>
          <div class="faq-stats">
            <span class="faq-chip"><i class="ph-fill ph-briefcase"></i> 120 full-time roles</span>
            <span class="faq-chip accent"><i class="ph-fill ph-hand-heart"></i> 800+ volunteers</span>
            <span class="faq-chip"><i class="ph-fill ph-house-line"></i> Remote-first</span>
          </div>
        </div>
      </details>

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

  <!-- MISSION -->
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
              <button class="btn-secondary" onclick="goto('programs')">See Programs</button>
            </div>
          </div>
          <div class="about-visual">
            <div class="about-stat"><div class="n">2025</div><div class="l">Year founded</div></div>
            <div class="about-stat"><div class="n">47</div><div class="l">Countries</div></div>
            <div class="about-stat"><div class="n">120</div><div class="l">Full-time staff</div></div>
            <div class="about-stat"><div class="n">800+</div><div class="l">Active volunteers</div></div>
            <div class="about-stat"><div class="n">1.2M</div><div class="l">Active users</div></div>
            <div class="about-stat"><div class="n">$0</div><div class="l">Cost of core tools</div></div>
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

    <section class="section">
      <div class="section-inner" style="max-width:920px;">
        <div class="section-heading">
          <div class="section-eyebrow">Our Journey</div>
          <h2 class="section-title">One year in. One mission ahead.</h2>
        </div>
        <div class="timeline">
          <div class="tl-item"><div class="tl-year">Jan '25</div><div><h4>Founded in Mumbai</h4><p>Two engineers — one sighted, one not — build the first prototype of our screen reader in a converted classroom.</p></div></div>
          <div class="tl-item"><div class="tl-year">Apr '25</div><div><h4>First 10,000 users</h4><p>The open-source release spreads across India, Kenya, and Brazil. Translation volunteers contribute 14 languages in six weeks.</p></div></div>
          <div class="tl-item"><div class="tl-year">Jul '25</div><div><h4>Navigation Aid launches</h4><p>Partnerships with transit authorities in Delhi, Nairobi, and São Paulo bring audio-described wayfinding to millions of commuters.</p></div></div>
          <div class="tl-item"><div class="tl-year">Oct '25</div><div><h4>Device Lending Library</h4><p>We begin distributing pre-configured smartphones to users without devices. 18,000 phones placed since.</p></div></div>
          <div class="tl-item"><div class="tl-year">Jan '26</div><div><h4>1 million active users</h4><p>A milestone reached on three continents simultaneously. Our tools are now used in 47 countries and 40+ languages.</p></div></div>
          <div class="tl-item"><div class="tl-year">Apr '26</div><div><h4>Open Source Grants Program</h4><p>We've now funded 63 independent accessibility projects across 28 countries — reaching 400,000+ additional beneficiaries.</p></div></div>
        </div>
      </div>
    </section>
  </div>

  <!-- TEAM -->
  <div class="subpage" data-sub="team">
    <section class="section">
      <div class="section-inner">
        <div class="section-heading">
          <div class="section-eyebrow">Leadership</div>
          <h2 class="section-title">The people behind TEWW</h2>
          <p class="section-subtitle">Our leadership reflects the community we serve — half of our executive team is visually impaired, and every office is led by someone local to the region.</p>
        </div>

        <div class="team-grid">
          ${teamCard('AR','bg-1','Arjun Rao','Co-founder & CEO','Blind from birth. Built the first TEWW Screen Reader prototype in 2025. Leads global strategy from Mumbai.','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=520&q=80')}
          ${teamCard('PS','bg-2','Priya Sharma','Co-founder & CTO','Engineer and disability-rights advocate. Oversees all product and engineering across the org.','https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=520&q=80')}
          ${teamCard('MO','bg-3','Maya Osei','Chief Program Officer','Runs field operations across 47 countries. Former director of West Africa Inclusion Network.','https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=520&q=80')}
          ${teamCard('DN','bg-4','Dr. Rhea Nair','Head of Research','Publishes field research on assistive tech adoption. Leads our accessibility audits and WCAG contributions.','https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=520&q=80')}
          ${teamCard('JK','bg-5','Juma Kimani','Director, East Africa','Oversees 11 country teams across East Africa. Based in Nairobi, speaks six languages.','https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=520&q=80')}
          ${teamCard('TL','bg-6','Tomás Luján','VP of Engineering','Low-vision from age nine. Leads our 40-person engineering org and open-source stewardship.','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=520&q=80')}
          ${teamCard('SF','bg-7','Sofia Ferreira','Head of Community','Runs our volunteer network of 800+ contributors and the TEWW Translator Guild.','https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=520&q=80')}
          ${teamCard('KA','bg-8','Kenji Arata','Head of Partnerships','Former mobile carrier exec. Leads device partnerships and subsidised data programs.','https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=520&q=80')}
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="section-inner">
        <div class="section-heading left" style="max-width:720px;">
          <div class="section-eyebrow">Board of Directors</div>
          <h2 class="section-title">Governance and oversight</h2>
          <p class="section-subtitle">A 12-member board of experts in disability rights, non-profit governance, and open technology.</p>
        </div>
        <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;">
          ${boardRow('Lillian Osundu','Board Chair · Disability Rights Fund')}
          ${boardRow('Sanjay Mehta','Treasurer · Accessibility Works Ltd.')}
          ${boardRow('Fatima Al-Harbi','Secretary · UN ESCWA, Inclusive Tech')}
          ${boardRow('Prof. Ian Wells','Director · MIT Media Lab')}
          ${boardRow('Beatriz Coelho','Director · Federação Brasileira de Inclusão')}
          ${boardRow('Hamid Reza','Director · Open Source Initiative')}
        </div>
        <p style="margin-top:20px;font-size:.9rem;color:var(--fg-muted);text-align:center;">Full board list and annual reports available at <a href="#">transparency.thirdeye.org</a></p>
      </div>
    </section>

    <section class="section">
      <div class="section-inner">
        <div class="section-heading">
          <div class="section-eyebrow">Our Team Globally</div>
          <h2 class="section-title">120 people. 47 countries. One mission.</h2>
        </div>
        <div class="feature-grid">
          <div class="feature-card"><div class="feature-icon"><i class="ph ph-globe-hemisphere-east"></i></div><h3>Regional offices</h3><p>Mumbai, Nairobi, São Paulo, Mexico City, Manila, Cairo, Dakar, Jakarta — every region led by local staff.</p></div>
          <div class="feature-card"><div class="feature-icon" style="background:var(--accent-subtle);color:var(--accent);"><i class="ph ph-users-three"></i></div><h3>50% representation</h3><p>Half of our staff and leadership are visually impaired. Nothing is built about us, without us.</p></div>
          <div class="feature-card"><div class="feature-icon"><i class="ph ph-translate"></i></div><h3>40+ languages</h3><p>Our TEWW Translator Guild — staffed by 240+ native-speaker volunteers — localises every interface and guide.</p></div>
        </div>
      </div>
    </section>
  </div>`;
}

function teamCard(initials, bg, name, role, bio, img) {
  const photo = img
    ? `<img class="team-photo-img" src="${img}" alt="Portrait of ${name.replace(/"/g,'&quot;')}" loading="lazy">`
    : '';
  return `<div class="team-card">
    <div class="team-photo ${bg}${img?' has-img':''}">${photo}<span class="initials" aria-hidden="${img?'true':'false'}">${initials}</span></div>
    <h4>${name}</h4>
    <div class="role">${role}</div>
    <p class="bio">${bio}</p>
  </div>`;
}
function boardRow(name, title) {
  return `<div style="display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid var(--border);">
    <div style="display:flex;align-items:center;gap:14px;">
      <div style="width:36px;height:36px;border-radius:50%;background:var(--bg-subtle);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:.78rem;color:var(--fg-muted);">${name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
      <div>
        <div style="font-family:var(--font-display);font-weight:600;color:var(--fg);font-size:.95rem;">${name}</div>
        <div style="font-size:.82rem;color:var(--fg-muted);">${title}</div>
      </div>
    </div>
    <i class="ph ph-arrow-up-right" style="color:var(--fg-subtle);"></i>
  </div>`;
}
