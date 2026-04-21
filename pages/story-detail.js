function renderStoryDetail() {
  return `
<style>
/* ── Story (story-detail) — narrative feature ───────── */
.story {
  background: var(--bg);
  color: var(--fg);
}

/* Hero — full-bleed photo w/ title overlay */
.story-hero {
  position: relative;
  min-height: 620px;
  height: calc(100vh - 68px);
  max-height: 820px;
  display: flex; align-items: flex-end;
  overflow: hidden;
  background: #0d0407;
}
.story-hero-photo {
  position: absolute; inset: 0; z-index: 0;
  background-image:
    linear-gradient(180deg, rgba(13,4,7,.2) 0%, rgba(13,4,7,.4) 40%, rgba(13,4,7,.92) 100%),
    linear-gradient(90deg, rgba(13,4,7,.55) 0%, rgba(13,4,7,0) 50%),
    url('https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?auto=format&fit=crop&w=2000&q=80');
  background-size: cover;
  background-position: center 35%;
}
.story-hero-photo::after {
  content: ''; position: absolute; inset: 0;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Ccircle cx='2' cy='2' r='.6' fill='%23ffffff' opacity='.06'/%3E%3C/svg%3E");
}
.story-hero-photo-label {
  position: absolute; left: 28px; bottom: 28px; z-index: 2;
  font-family: var(--font-display);
  font-size: .68rem; font-weight: 600;
  letter-spacing: .14em; text-transform: uppercase;
  color: rgba(255,255,255,.6);
}
.story-hero-inner {
  position: relative; z-index: 2;
  max-width: var(--maxw);
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--space-8) 72px;
  color: #fff;
}
.story-hero-crumbs {
  display: inline-flex; align-items: center; gap: 10px;
  font-family: var(--font-display);
  font-size: .72rem; font-weight: 600;
  letter-spacing: .14em; text-transform: uppercase;
  color: rgba(255,255,255,.7);
  margin-bottom: 22px;
}
.story-hero-crumbs a { color: rgba(255,255,255,.7); }
.story-hero-crumbs a:hover { color: #fff; }
.story-hero-crumbs .sep { color: rgba(255,255,255,.4); }
.story-hero-crumbs .curr { color: #fff; }

.story-hero-tag {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 7px 14px 7px 12px;
  background: rgba(231,96,33,.18);
  border: 1px solid rgba(231,96,33,.4);
  color: #fff;
  font-family: var(--font-display);
  font-size: .7rem; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase;
  border-radius: var(--radius-full);
  backdrop-filter: blur(10px);
  margin-bottom: 22px;
}
.story-hero-tag .dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px rgba(231,96,33,.25);
}
.story-hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 5.2vw, 4.6rem);
  font-weight: 700;
  line-height: .98;
  letter-spacing: -.04em;
  color: #fff;
  margin-bottom: 22px;
  max-width: 22ch;
  text-wrap: balance;
  text-shadow: 0 2px 40px rgba(0,0,0,.4);
}
.story-hero-title em {
  font-style: normal;
  color: #fff;
  position: relative; display: inline-block;
}
.story-hero-title em::after {
  content: ''; position: absolute;
  left: 0; right: 0; bottom: 8px; height: 14px;
  background: var(--accent);
  z-index: -1;
  border-radius: 2px;
}
.story-hero-stand {
  font-family: var(--font-display);
  font-size: clamp(1.05rem, 1.5vw, 1.25rem);
  line-height: 1.5;
  font-weight: 400;
  max-width: 58ch;
  color: rgba(255,255,255,.88);
  margin-bottom: 34px;
  letter-spacing: -.01em;
}
.story-hero-meta {
  display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
  padding-top: 26px;
  border-top: 1px solid rgba(255,255,255,.16);
}
.story-hero-reporter {
  display: flex; align-items: center; gap: 14px;
}
.story-hero-reporter .sh-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, #4d7eff 0%, #1f61ff 100%);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-weight: 700; font-size: .88rem;
  flex-shrink: 0;
}
.story-hero-reporter .sh-who .name {
  font-family: var(--font-display);
  font-weight: 600; font-size: .95rem;
  color: #fff; line-height: 1.2;
}
.story-hero-reporter .sh-who .role {
  font-size: .78rem; color: rgba(255,255,255,.7);
  margin-top: 3px;
}
.story-hero-metrics {
  display: flex; gap: 18px; flex-wrap: wrap;
  font-family: var(--font-display);
  font-size: .82rem; color: rgba(255,255,255,.75);
  font-weight: 500;
}
.story-hero-metrics .mi {
  display: inline-flex; align-items: center; gap: 6px;
}
.story-hero-metrics .mi i { color: rgba(255,255,255,.55); font-size: 14px; }

.story-hero-listen {
  margin-left: auto;
  display: inline-flex; align-items: center; gap: 10px;
  padding: 12px 18px 12px 14px;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.2);
  color: #fff;
  font-family: var(--font-display);
  font-size: .88rem; font-weight: 600;
  border-radius: var(--radius-full);
  cursor: pointer;
  backdrop-filter: blur(12px);
  transition: background .15s, border-color .15s;
}
.story-hero-listen:hover { background: rgba(255,255,255,.18); border-color: rgba(255,255,255,.4); }
.story-hero-listen i { font-size: 18px; }

/* ── Locator strip (below hero) ─── */
.story-locator {
  background: var(--bg-inverse);
  color: var(--fg-inverse);
  padding: 20px var(--space-8);
}
[data-theme="dark"] .story-locator, [data-theme="high-contrast"] .story-locator {
  background: var(--bg-subtle); color: var(--fg);
}
.story-locator-inner {
  max-width: var(--maxw);
  margin: 0 auto;
  display: flex; align-items: center; gap: 32px;
  flex-wrap: wrap;
  font-family: var(--font-display);
  font-size: .82rem; letter-spacing: .06em;
}
.story-locator-inner .sl-pair {
  display: inline-flex; align-items: center; gap: 10px;
}
.story-locator-inner .sl-label {
  font-size: .68rem; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase;
  opacity: .5;
}
.story-locator-inner .sl-val { font-weight: 500; opacity: .92; }
.story-locator-inner .sl-sep { opacity: .25; }

/* ── Narrative body ─── */
.story-body-wrap {
  max-width: 720px;
  margin: 0 auto;
  padding: 72px var(--space-8) 80px;
}
.story-body {
  font-family: var(--font-body);
  font-size: 1.12rem;
  line-height: 1.78;
  color: var(--fg);
}
.story-body > * + * { margin-top: 1.3em; }
.story-body p:first-of-type::first-letter {
  font-family: var(--font-display);
  float: left;
  font-size: 4.8em;
  line-height: .88;
  padding: 6px 14px 0 0;
  color: var(--accent);
  font-weight: 700;
}
.story-body p { color: var(--fg); }
.story-body strong { font-weight: 700; color: var(--fg); }
.story-body em { font-style: italic; }
.story-body a { color: var(--brand); border-bottom: 1px solid var(--brand-subtle); }
.story-body a:hover { border-bottom-color: var(--brand); }

.story-section-head {
  display: flex; align-items: center; gap: 14px;
  margin: 2.4em 0 1em;
  font-family: var(--font-display);
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: var(--fg-subtle);
}
.story-section-head::before, .story-section-head::after {
  content: ''; flex: 1; height: 1px;
  background: var(--border);
}
.story-section-head::before { flex: 0 0 24px; }

.story-h2 {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 2.6vw, 2rem);
  font-weight: 700;
  letter-spacing: -.025em;
  line-height: 1.15;
  color: var(--fg);
  margin: 1.6em 0 .5em;
  text-wrap: balance;
  max-width: 22ch;
}
.story-h2 em { color: var(--accent); font-style: normal; }

/* Big pull-quote */
.story-pull {
  margin: 2.4em calc(-1 * var(--space-4)) 2.4em;
  padding: 36px 40px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-left: 4px solid var(--accent);
  border-radius: var(--radius-lg);
  font-family: var(--font-display);
  font-size: 1.55rem;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -.02em;
  color: var(--fg);
  position: relative;
}
.story-pull::before {
  content: '\\201C';
  position: absolute; top: -18px; left: 24px;
  font-family: var(--font-display);
  font-size: 5.5rem;
  line-height: 1;
  color: var(--accent);
  opacity: .35;
  pointer-events: none;
}
.story-pull cite {
  display: block;
  margin-top: 18px;
  font-family: var(--font-body);
  font-size: .82rem; font-weight: 500;
  letter-spacing: .1em; text-transform: uppercase;
  color: var(--fg-muted);
  font-style: normal;
}

/* Photo breaks */
.story-photo {
  margin: 3em calc(50% - 50vw);
  max-width: 100vw;
  position: relative;
}
.story-photo .sp-frame {
  width: 100%;
  aspect-ratio: 21 / 9;
  max-height: 560px;
  position: relative; overflow: hidden;
  background: #0d0407;
}
.story-photo .sp-frame-1 {
  background-image:
    linear-gradient(180deg, rgba(13,4,7,.1) 30%, rgba(13,4,7,.55) 100%),
    url('https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=2000&q=80');
  background-size: cover;
  background-position: center;
}
.story-photo .sp-frame-2 {
  background-image:
    linear-gradient(180deg, rgba(13,4,7,.1) 30%, rgba(13,4,7,.55) 100%),
    url('https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=2000&q=80');
  background-size: cover;
  background-position: center;
}
.story-photo .sp-ico {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,.2);
  font-size: 120px;
}
.story-photo .sp-badge {
  position: absolute; top: 20px; left: calc(50% - min(590px, 47vw));
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 14px;
  background: rgba(0,0,0,.45);
  border: 1px solid rgba(255,255,255,.18);
  color: #fff;
  backdrop-filter: blur(8px);
  border-radius: var(--radius-full);
  font-family: var(--font-display);
  font-size: .68rem; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase;
}
.story-photo-caption {
  max-width: 720px;
  margin: 14px auto 0;
  padding: 0 var(--space-8);
  display: flex; gap: 12px;
  font-size: .84rem;
  color: var(--fg-muted);
  line-height: 1.55;
  font-style: italic;
}
.story-photo-caption::before {
  content: ''; width: 2px; background: var(--accent);
  flex-shrink: 0;
}

/* Info aside — "what TEWW provided" */
.story-aside {
  margin: 2.6em 0;
  padding: 28px 32px;
  background: var(--brand-subtle);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(31,97,255,.18);
}
[data-theme="dark"] .story-aside { background: rgba(31,97,255,.12); border-color: rgba(77,126,255,.25); }
.story-aside-label {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-display);
  font-size: .68rem; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase;
  color: var(--brand);
  margin-bottom: 14px;
}
.story-aside-label::before {
  content: ''; width: 6px; height: 6px;
  border-radius: 50%; background: var(--brand);
}
.story-aside h4 {
  font-family: var(--font-display);
  font-size: 1.25rem; font-weight: 700;
  letter-spacing: -.02em;
  color: var(--fg);
  margin-bottom: 18px;
  line-height: 1.25;
}
.story-aside ul {
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 28px;
}
.story-aside li {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: .95rem;
  line-height: 1.5;
  color: var(--fg);
}
.story-aside li i {
  color: var(--brand);
  font-size: 16px;
  margin-top: 3px;
  flex-shrink: 0;
}
.story-aside li strong {
  display: block;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: .92rem;
  color: var(--fg);
  margin-bottom: 2px;
}
.story-aside li span {
  font-size: .82rem; color: var(--fg-muted);
}

/* Highlighted stat */
.story-stat-row {
  margin: 3em 0;
  padding: 32px 0;
  border-top: 2px solid var(--fg);
  border-bottom: 2px solid var(--fg);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
[data-theme="dark"] .story-stat-row, [data-theme="high-contrast"] .story-stat-row {
  border-top-color: var(--border-strong);
  border-bottom-color: var(--border-strong);
}
.story-stat {
  text-align: left;
}
.story-stat .n {
  font-family: var(--font-display);
  font-size: 2.6rem;
  font-weight: 700;
  letter-spacing: -.03em;
  color: var(--fg);
  line-height: 1;
}
.story-stat .n em { color: var(--accent); font-style: normal; }
.story-stat .l {
  margin-top: 10px;
  font-size: .9rem;
  color: var(--fg-muted);
  line-height: 1.4;
  max-width: 24ch;
}

/* End-of-story dingbat */
.story-end {
  display: flex; align-items: center; justify-content: center;
  gap: 6px;
  margin: 3em 0 1.4em;
  padding-top: 2em;
  border-top: 1px solid var(--border);
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--accent);
  letter-spacing: .4em;
}

/* Sticky reader progress bar */
.story-progress {
  position: fixed; top: 68px; left: 0; right: 0;
  height: 3px; z-index: 95;
  background: var(--border);
}
.story-progress .bar {
  height: 100%; width: 0%;
  background: var(--accent);
  transition: width .1s linear;
}

/* ── Post-article: subject block, bylines, related ─── */
.story-subject-bar {
  background: var(--bg-inverse);
  color: var(--fg-inverse);
  padding: 56px var(--space-8);
}
[data-theme="dark"] .story-subject-bar, [data-theme="high-contrast"] .story-subject-bar {
  background: var(--bg-subtle); color: var(--fg);
}
.story-subject-inner {
  max-width: var(--maxw);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 48px;
  align-items: center;
}
.story-subject-label {
  font-family: var(--font-display);
  font-size: .72rem; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 16px;
}
.story-subject-inner h3 {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 2.6vw, 2rem);
  font-weight: 700;
  letter-spacing: -.025em;
  line-height: 1.15;
  margin-bottom: 14px;
}
.story-subject-inner p {
  font-size: 1rem;
  line-height: 1.7;
  opacity: .85;
  margin-bottom: 24px;
  max-width: 56ch;
}
[data-theme="dark"] .story-subject-inner p { color: var(--fg-muted); opacity: 1; }
.story-subject-actions {
  display: flex; gap: 12px; flex-wrap: wrap;
}
.story-subject-facts {
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: var(--radius-xl);
  padding: 32px;
}
[data-theme="dark"] .story-subject-facts, [data-theme="high-contrast"] .story-subject-facts {
  background: var(--bg-elevated); border-color: var(--border);
}
.story-subject-facts h4 {
  font-family: var(--font-display);
  font-size: .72rem; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase;
  opacity: .6;
  margin-bottom: 18px;
}
.story-subject-facts dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px 20px;
  font-size: .92rem;
}
.story-subject-facts dt {
  font-family: var(--font-display);
  font-weight: 600;
  opacity: .7;
}
.story-subject-facts dd { line-height: 1.5; }

.story-credits {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 40px var(--space-8);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  border-bottom: 1px solid var(--border);
}
.story-credit-col h5 {
  font-family: var(--font-display);
  font-size: .7rem; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase;
  color: var(--fg-subtle);
  margin-bottom: 14px;
}
.story-credit-col ul {
  list-style: none;
  display: flex; flex-direction: column; gap: 10px;
}
.story-credit-col li {
  display: flex; align-items: center; gap: 12px;
  font-size: .92rem;
  color: var(--fg);
}
.story-credit-col li .av {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-weight: 700; font-size: .72rem;
  flex-shrink: 0;
}
.story-credit-col li .r {
  font-size: .78rem; color: var(--fg-muted);
  margin-left: auto;
}

.story-more {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 56px var(--space-8) 96px;
}
.story-more h3 {
  font-family: var(--font-display);
  font-size: 1.3rem; font-weight: 700;
  letter-spacing: -.015em;
  color: var(--fg);
  margin-bottom: 24px;
}

@media (max-width: 900px) {
  .story-subject-inner { grid-template-columns: 1fr; }
  .story-credits { grid-template-columns: 1fr; gap: 28px; }
  .story-aside ul { grid-template-columns: 1fr; }
  .story-stat-row { grid-template-columns: 1fr; gap: 20px; }
  .story-photo { margin: 2em 0; }
  .story-photo .sp-badge { left: 16px; }
}
</style>

<div class="story-progress" id="storyProgress" aria-hidden="true"><div class="bar"></div></div>

<article class="story">
  <header class="story-hero">
    <div class="story-hero-photo" aria-hidden="true"></div>
    <span class="story-hero-photo-label">Photograph: Juma Kimani for TEWW</span>
    <div class="story-hero-inner">
      <div class="story-hero-crumbs">
        <a href="#" onclick="goto('documents');return false;">Documents</a>
        <span class="sep">/</span>
        <a href="#" onclick="goto('documents','stories');return false;">Stories</a>
        <span class="sep">/</span>
        <span class="curr">Lagos, Nigeria</span>
      </div>
      <span class="story-hero-tag"><span class="dot"></span> Featured Story · 12 min</span>
      <h1 class="story-hero-title">For the first time, the internet feels like <em>mine too.</em></h1>
      <p class="story-hero-stand">A year ago Amara Mwangi had never used a smartphone. Today she runs a forty-customer delivery business in Lagos — and she is blind. We spent a week with her learning how the tools fit into a day.</p>

      <div class="story-hero-meta">
        <div class="story-hero-reporter">
          <div class="sh-avatar">MO</div>
          <div class="sh-who">
            <div class="name">Maya Osei</div>
            <div class="role">Chief Program Officer · reporting from Lagos</div>
          </div>
        </div>
        <div class="story-hero-metrics">
          <span class="mi"><i class="ph ph-calendar-blank"></i> April 17, 2026</span>
          <span class="mi"><i class="ph ph-globe-hemisphere-west"></i> Lagos, Nigeria</span>
          <span class="mi"><i class="ph ph-clock"></i> 12 min read</span>
        </div>
        <button class="story-hero-listen" aria-label="Listen to this story"><i class="ph-fill ph-play"></i> Listen · 18 min</button>
      </div>
    </div>
  </header>

  <div class="story-locator">
    <div class="story-locator-inner">
      <div class="sl-pair"><span class="sl-label">Subject</span><span class="sl-val">Amara Mwangi, 29</span></div>
      <span class="sl-sep">·</span>
      <div class="sl-pair"><span class="sl-label">Occupation</span><span class="sl-val">Delivery business owner</span></div>
      <span class="sl-sep">·</span>
      <div class="sl-pair"><span class="sl-label">Location</span><span class="sl-val">Ikeja, Lagos, Nigeria</span></div>
      <span class="sl-sep">·</span>
      <div class="sl-pair"><span class="sl-label">Tools used</span><span class="sl-val">Screen Reader · Navigation Aid · Marketplace</span></div>
      <span class="sl-sep">·</span>
      <div class="sl-pair"><span class="sl-label">User since</span><span class="sl-val">March 2025</span></div>
    </div>
  </div>

  <div class="story-body-wrap">
    <div class="story-body">
      <p>The morning starts at 5:40 a.m., which is thirty minutes before the sun. Amara wakes to a soft voice she configured herself — the phone's first trick, and the one she still finds most satisfying. The voice is not an alarm. It is a list. Three customers have messaged overnight. Two orders need confirming before the market opens at seven.</p>

      <p>She sits up, puts her feet on the cool concrete floor, and reaches for the phone on the bedside shelf. The phone is a second-hand Android she bought for ₦45,000 in August. It is not new. Nothing in her setup is new. Everything in her setup works.</p>

      <p>"I know exactly what this phone sounds like in every part of the day," she says, unprompted, when I ask her to describe her relationship with it. "It sounds different at five a.m. than at seven p.m. Not because the phone changed. Because I did."</p>

      <div class="story-section-head">I · Before the phone</div>

      <p>Amara lost the last of her central vision in 2021, at twenty-four. She had been a primary-school teacher in Mushin. The school had no plan for her and no budget for one, and she did not fight them about it. She moved back home to Ikeja and, for most of two years, stayed there.</p>

      <p>"I did not apply for anything," she tells me. "I did not feel like a person who could apply for things. That is what I will say about those two years. It was not sadness. It was just that the shape of an application — the forms, the calls, the reading — had become a door I could not open."</p>

      <p>She says this matter-of-factly, in the way she says almost everything. Amara has the specific calm of people who have survived the worst version of a question and returned to it anyway.</p>

      <blockquote class="story-pull">
        I did not feel like a person who could apply for things. The shape of an application had become a door I could not open.
        <cite>— Amara Mwangi, recounting 2022</cite>
      </blockquote>

      <p>In January of 2025 her cousin Funmi came home from Accra with an old Android phone in a plastic bag and a printout of our community onboarding guide. Funmi had read about our Lagos launch in a local paper. The printout was four pages. The phone was a Tecno Camon 12 with a cracked screen protector. Amara's first forty-eight hours with both were, she says, "the hardest week of my life, compressed into two days."</p>

      <figure class="story-photo">
        <div class="sp-frame sp-frame-1">
          <span class="sp-badge"><i class="ph ph-camera"></i> Ikeja · 06:12</span>
          <i class="ph-fill ph-coffee sp-ico"></i>
        </div>
      </figure>
      <p class="story-photo-caption">Amara reviews overnight orders in her kitchen, before the market opens. The voice she hears is not a notification — it's a structured rundown of everything she needs to decide in the next hour.</p>

      <p>By Thursday of that first week, she had sent her first WhatsApp message without help. By the following Monday, she had listed her first plate of jollof rice on our community marketplace. The plate sold in forty-three minutes. The buyer lived two streets away. Amara's mother delivered it and came home with ₦3,500, folded.</p>

      <p>"My mother cried," Amara says. "I did not. I was busy listing the next plate."</p>

      <div class="story-section-head">II · A day, in detail</div>

      <h2 class="story-h2">By seven she has confirmed six orders, placed a market run, and <em>made breakfast.</em></h2>

      <p>I follow Amara on a Wednesday in March. We start at the market. She walks ahead of me with a cane in her left hand and the phone in her right, earbuds in both ears but turned to a volume that still lets her hear the street. She greets five vendors by name before she reaches the one she came for.</p>

      <p>The Navigation Aid, she explains, does not announce every step. "It would drive me mad, and I would stop listening." Instead, it announces three things: turn cues, named landmarks she has asked to be told about (her tailor, the pharmacy, two specific food stalls), and — this is her customisation — the bus conductor's chant when a matatu passes in the right direction. The tool learned the chant last November. It has not missed one since.</p>

      <div class="story-aside">
        <div class="story-aside-label">What TEWW Provides</div>
        <h4>The toolkit Amara uses, end-to-end. All free, all open, all installed on a phone she bought on the open market.</h4>
        <ul>
          <li>
            <i class="ph-fill ph-eye"></i>
            <div>
              <strong>Screen Reader</strong>
              <span>Offline-first TTS in 12 Nigerian languages, including Igbo and Yoruba.</span>
            </div>
          </li>
          <li>
            <i class="ph-fill ph-map-trifold"></i>
            <div>
              <strong>Navigation Aid</strong>
              <span>Community-tagged landmarks, matatu routes, turn cues on 3G.</span>
            </div>
          </li>
          <li>
            <i class="ph-fill ph-storefront"></i>
            <div>
              <strong>Community Marketplace</strong>
              <span>Voice-first listings, WhatsApp-native checkout, no data plan required.</span>
            </div>
          </li>
          <li>
            <i class="ph-fill ph-chats-teardrop"></i>
            <div>
              <strong>Peer Support</strong>
              <span>A Lagos cohort of 140 users who meet twice a month, online and in person.</span>
            </div>
          </li>
        </ul>
      </div>

      <p>Back at the house by half-past seven, Amara cooks. The kitchen is shared; there is a small radio in the corner tuned to Wazobia FM. The phone sits on a shelf above the stove. It speaks when she asks it to. "I asked for a kitchen that would not fight me," she says. "I got one."</p>

      <p>By nine she has plated and photographed six orders — the Marketplace coaches her through composition with a live audio prompt: <em>move the phone left, up, good, the food is centred</em> — and handed them to her two runners, one of whom is her youngest brother. By ten the first payment has landed.</p>

      <figure class="story-photo">
        <div class="sp-frame sp-frame-2">
          <span class="sp-badge"><i class="ph ph-camera"></i> Lagos · 15:40</span>
          <i class="ph-fill ph-package sp-ico"></i>
        </div>
      </figure>
      <p class="story-photo-caption">An afternoon run from Amara's kitchen to a customer's office in Maryland. The tools do not run the business — Amara does. The tools remove every step that used to require someone else to read for her.</p>

      <div class="story-stat-row">
        <div class="story-stat">
          <div class="n"><em>40</em></div>
          <div class="l">repeat customers after twelve months of operation</div>
        </div>
        <div class="story-stat">
          <div class="n"><em>₦180k</em></div>
          <div class="l">monthly gross — up from ₦3,500 on her first plate sold</div>
        </div>
        <div class="story-stat">
          <div class="n"><em>0</em></div>
          <div class="l">dedicated assistants or support staff. Two runners, both family. That is it.</div>
        </div>
      </div>

      <div class="story-section-head">III · What the tools don't do</div>

      <p>I ask Amara what is still hard. She is ready for this question; she answers it a lot, and she has a list.</p>

      <p>"Banks." She counts on her fingers. "Banks are a disaster. The app says it supports accessibility. The app does not support accessibility. I keep a notebook of which screens break and which colleagues I can call when they do. That is not your tools. That is the banks."</p>

      <p>"Forms with a stupid font." She keeps counting. "Forms that have a little picture of a word you have to read aloud into the microphone. I cannot do any of those. I have never been able to do any of those. I am not sure why they still exist."</p>

      <p>"And people," she says, quieter. "Most of my day is the tools. When the day is hard, it is people. Customers who hear my voice on a call and cancel their order. A driver who told my brother last month he should be ashamed of himself for letting me work. The tools do not fix that. I am not sure what does."</p>

      <blockquote class="story-pull">
        The tools do not fix everything. They fix enough of the small things that the big things stop eating the whole day. That is what I wish people understood.
        <cite>— Amara, on what independence actually feels like</cite>
      </blockquote>

      <p>She pauses. Then, almost as an afterthought: "But most days, it is not hard. Most days, it is just work."</p>

      <div class="story-section-head">IV · What comes next</div>

      <p>Amara is saving for a newer phone — not because her current one has failed her, but because she has started thinking about scale. Two of the women in her Lagos cohort have asked her to mentor them. A third has floated the idea of a shared delivery co-operative. Amara is reading about logistics. Reading, in her case, means listening. She is listening at 1.8× speed now. Six months ago she was at 1.1×.</p>

      <p>"I am saving," she tells me. "For a phone. And for the co-op. We will see which one happens first."</p>

      <p>When I leave her house on the Thursday evening, she is already typing a response to a customer who wants to know whether tomorrow's batch will include the egusi with assorted meat. The reply, when it posts, is warm and specific. It sounds like her. It has no typos.</p>

      <p>"The tools do not fix everything," she had said earlier, when I was still looking for the quote that would hold the piece together. "They fix enough of the small things that the big things stop eating the whole day. That is what I wish people understood."</p>

      <p>It is dark by the time I reach the main road. A matatu passes me in the right direction. Its conductor is chanting the route I need. I am not using the Navigation Aid. I hear him anyway. I think about Amara and the particular patience of a tool that learned the cadence of that chant over several months, because it mattered to her. Then I get on the bus.</p>

      <div class="story-end">§ § §</div>

      <p style="font-size:.92rem; color: var(--fg-muted); line-height: 1.7;"><strong style="color: var(--fg);">Reporter's note —</strong> Amara reviewed this piece before publication and requested two small changes, both of which we made. The story is hers; the telling is mine. Any errors are my own.</p>
    </div>
  </div>

  <section class="story-subject-bar">
    <div class="story-subject-inner">
      <div>
        <div class="story-subject-label">About the subject</div>
        <h3>Amara Mwangi runs a food delivery business in Lagos.</h3>
        <p>She is twenty-nine, blind since 2021, and — as she will tell you cheerfully — bad at small talk and very good at jollof rice. If you are in Lagos, you can find her shop on our community marketplace. She is saving for a phone.</p>
        <div class="story-subject-actions">
          <button class="btn-accent"><i class="ph-fill ph-heart"></i> Support Amara's cohort</button>
          <button class="btn-ghost" style="background: rgba(255,255,255,.08); color: #fff; border: 1.5px solid rgba(255,255,255,.3); font-family: var(--font-display); font-weight: 600; padding: 13px 26px; border-radius: var(--radius-full); display: inline-flex; align-items: center; gap: 8px; cursor: pointer;">Share this story <i class="ph ph-share-network"></i></button>
        </div>
      </div>
      <div class="story-subject-facts">
        <h4>At a glance</h4>
        <dl>
          <dt>Name</dt><dd>Amara Mwangi</dd>
          <dt>Age</dt><dd>29</dd>
          <dt>Location</dt><dd>Ikeja, Lagos, Nigeria</dd>
          <dt>Vision</dt><dd>No central vision since 2021</dd>
          <dt>Devices</dt><dd>Tecno Camon 12 (Android 11)</dd>
          <dt>Languages</dt><dd>Yoruba, English, some Igbo</dd>
          <dt>TEWW cohort</dt><dd>Lagos 03 · since Mar 2025</dd>
        </dl>
      </div>
    </div>
  </section>

  <div class="story-credits">
    <div class="story-credit-col">
      <h5>Reported and written by</h5>
      <ul>
        <li><span class="av">MO</span>Maya Osei<span class="r">Chief Program Officer</span></li>
      </ul>
    </div>
    <div class="story-credit-col">
      <h5>With</h5>
      <ul>
        <li><span class="av">JK</span>Juma Kimani<span class="r">Photography</span></li>
        <li><span class="av">FS</span>Funmi Salako<span class="r">Translation · Yoruba</span></li>
        <li><span class="av">LE</span>Liam Edwards<span class="r">Editing</span></li>
      </ul>
    </div>
  </div>

  <section class="story-more">
    <h3>More from the field</h3>
    <div class="doc-grid">
      ${typeof doc === 'function' ? doc('','type-story','story','Story','','Kofi builds a software company from his kitchen','Born blind. Taught himself to code. Now ships accessibility tools to 200,000 developers.','Maya Osei','MO','8 min · Apr 12') : ''}
      ${typeof doc === 'function' ? doc('','type-story2','story','Story','','Miriam rides solo — the Nairobi matatu system, unassisted',"How the Navigation Aid integrates with one of the world's most informal transit networks.",'Juma Kimani','JK','4 min · Apr 5') : ''}
      ${typeof doc === 'function' ? doc('','type-story','story','Story','','Ten students, one year of code','The inaugural class of Access Scholars graduates from Cairo.','Fatima Al-Harbi','FA','9 min · Mar 30') : ''}
    </div>
    <div style="display:flex;justify-content:center;margin-top:36px;">
      <button class="btn-secondary" onclick="goto('documents','stories')"><i class="ph ph-arrow-left"></i> Back to all stories</button>
    </div>
  </section>
</article>
`;
}

// Reader progress bar (runs once)
(function () {
  if (window.__storyProgressWired) return;
  window.__storyProgressWired = true;

  function tick() {
    const bar = document.querySelector('#storyProgress .bar');
    if (!bar) return;
    const body = document.querySelector('.story-body');
    if (!body) { bar.style.width = '0%'; return; }
    const rect = body.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const total = rect.height - window.innerHeight + 200;
    const progressed = window.scrollY - top + 120;
    const pct = Math.max(0, Math.min(100, (progressed / Math.max(1, total)) * 100));
    bar.style.width = pct.toFixed(1) + '%';
  }
  let raf = false;
  window.addEventListener('scroll', () => {
    if (raf) return;
    raf = true;
    requestAnimationFrame(() => { raf = false; tick(); });
  });
})();
