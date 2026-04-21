function renderBlogDetail() {
  return `
<style>
/* ── Article (blog-detail) ───────────────────────────── */
.article {
  background: var(--bg);
  color: var(--fg);
}
.article-top {
  max-width: 920px;
  margin: 0 auto;
  padding: 56px var(--space-8) 40px;
}
.article-breadcrumb {
  display: inline-flex; align-items: center; gap: 10px;
  font-family: var(--font-display);
  font-size: .72rem; font-weight: 600;
  letter-spacing: .14em; text-transform: uppercase;
  color: var(--fg-muted);
  margin-bottom: 28px;
}
.article-breadcrumb a { color: var(--fg-muted); }
.article-breadcrumb a:hover { color: var(--brand); }
.article-breadcrumb .sep { color: var(--fg-subtle); font-weight: 400; }
.article-breadcrumb .curr { color: var(--fg); }

.article-tag {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 12px 6px 10px;
  background: var(--brand-subtle);
  color: var(--brand);
  font-family: var(--font-display);
  font-size: .72rem; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase;
  border-radius: var(--radius-full);
  margin-bottom: 22px;
}
.article-tag::before {
  content: ''; width: 8px; height: 8px; border-radius: 50%;
  background: var(--brand);
}

.article-title {
  font-family: var(--font-display);
  font-size: clamp(2.1rem, 4.6vw, 3.5rem);
  font-weight: 700; letter-spacing: -.035em;
  line-height: 1.05;
  color: var(--fg);
  margin-bottom: 22px;
  text-wrap: balance;
  max-width: 22ch;
}
.article-title em { font-style: normal; color: var(--brand); }

.article-standfirst {
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 1.6vw, 1.35rem);
  font-weight: 400;
  color: var(--fg-muted);
  line-height: 1.5;
  letter-spacing: -.012em;
  max-width: 64ch;
  margin-bottom: 36px;
}

.article-byline {
  display: flex; align-items: center; justify-content: space-between;
  gap: 20px; flex-wrap: wrap;
  padding: 22px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.article-byline-author {
  display: flex; align-items: center; gap: 14px;
}
.article-byline-avatar {
  width: 46px; height: 46px; border-radius: 50%;
  background: linear-gradient(135deg, #1f61ff 0%, #4d7eff 100%);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-weight: 700; font-size: .9rem;
  flex-shrink: 0;
}
.article-byline-who .name {
  font-family: var(--font-display);
  font-weight: 600; font-size: .95rem; color: var(--fg);
  line-height: 1.2;
}
.article-byline-who .role {
  font-size: .78rem; color: var(--fg-muted);
  margin-top: 3px;
}
.article-byline-meta {
  display: flex; align-items: center; gap: 18px;
  font-family: var(--font-display);
  font-size: .78rem; color: var(--fg-muted);
  font-weight: 500;
}
.article-byline-meta .mi {
  display: inline-flex; align-items: center; gap: 6px;
}
.article-byline-meta .mi i { color: var(--fg-subtle); font-size: 14px; }
.article-share {
  display: flex; gap: 8px;
}
.article-share button {
  width: 36px; height: 36px; border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg-elevated); color: var(--fg-muted);
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 15px;
  transition: border-color .15s, color .15s, background .15s;
}
.article-share button:hover {
  border-color: var(--brand); color: var(--brand);
  background: var(--brand-subtle);
}

/* Hero visual */
.article-hero-vis {
  margin: 48px auto 0;
  max-width: var(--maxw);
  padding: 0 var(--space-8);
}
.article-hero-image {
  width: 100%;
  aspect-ratio: 21 / 9;
  border-radius: var(--radius-xl);
  position: relative; overflow: hidden;
  background:
    radial-gradient(circle at 30% 40%, rgba(31,97,255,.32), transparent 45%),
    radial-gradient(circle at 72% 60%, rgba(231,96,33,.28), transparent 48%),
    linear-gradient(135deg, #0d0410 0%, #1a1a2e 100%);
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border);
}
.article-hero-image .ahi-fig {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
}
.article-hero-image .ahi-fig svg {
  width: 42%; max-width: 340px; opacity: .95; color: #fff;
  filter: drop-shadow(0 14px 48px rgba(0,0,0,.3));
}
.article-hero-image .ahi-badge {
  position: absolute; bottom: 20px; left: 20px;
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 14px;
  background: rgba(255,255,255,.12);
  color: #fff;
  border: 1px solid rgba(255,255,255,.2);
  backdrop-filter: blur(12px);
  border-radius: var(--radius-full);
  font-family: var(--font-display);
  font-size: .72rem; font-weight: 600;
  letter-spacing: .12em; text-transform: uppercase;
}
.article-hero-caption {
  font-size: .82rem; color: var(--fg-muted);
  margin-top: 14px; font-style: italic;
  display: flex; align-items: flex-start; gap: 8px;
  padding-left: 4px;
}
.article-hero-caption::before {
  content: ''; width: 2px; height: 18px;
  background: var(--accent); flex-shrink: 0; margin-top: 2px;
}

/* ── Body layout ───────── */
.article-body-wrap {
  max-width: var(--maxw);
  margin: 56px auto 0;
  padding: 0 var(--space-8) 80px;
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 72px;
  align-items: start;
}

.article-toc {
  position: sticky; top: 92px;
  padding: 4px 0;
  border-left: 2px solid var(--border);
  max-height: calc(100vh - 120px);
  overflow: auto;
}
.article-toc .toc-label {
  font-family: var(--font-display);
  font-size: .68rem; font-weight: 700;
  letter-spacing: .16em; text-transform: uppercase;
  color: var(--fg-subtle);
  padding: 0 0 12px 18px;
  margin-bottom: 4px;
}
.article-toc ol {
  list-style: none;
  display: flex; flex-direction: column;
  counter-reset: toc;
}
.article-toc li {
  counter-increment: toc;
}
.article-toc a {
  display: block;
  font-family: var(--font-display);
  font-size: .85rem; font-weight: 500;
  color: var(--fg-muted);
  padding: 8px 0 8px 18px;
  margin-left: -2px;
  border-left: 2px solid transparent;
  line-height: 1.35;
  transition: color .15s, border-color .15s;
}
.article-toc a::before {
  content: counter(toc, decimal-leading-zero);
  font-size: .68rem; font-weight: 700;
  letter-spacing: .06em;
  color: var(--fg-subtle);
  display: inline-block; width: 26px;
}
.article-toc a:hover { color: var(--fg); }
.article-toc a.active {
  color: var(--brand);
  border-left-color: var(--brand);
}
.article-toc a.active::before { color: var(--brand); }

.article-body {
  max-width: 680px;
  font-size: 1.08rem;
  line-height: 1.75;
  color: var(--fg);
}
.article-body > * + * { margin-top: 1.2em; }
.article-body h2 {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 2.4vw, 1.85rem);
  font-weight: 700;
  letter-spacing: -.02em;
  line-height: 1.2;
  color: var(--fg);
  margin: 2.2em 0 .65em;
  scroll-margin-top: 92px;
  text-wrap: balance;
}
.article-body h3 {
  font-family: var(--font-display);
  font-size: 1.18rem;
  font-weight: 700;
  letter-spacing: -.01em;
  color: var(--fg);
  margin: 1.6em 0 .45em;
}
.article-body p {
  color: var(--fg);
  font-family: var(--font-body);
}
.article-body p.deck {
  font-family: var(--font-display);
  font-size: 1.22rem;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: -.01em;
  color: var(--fg);
}
.article-body strong { color: var(--fg); font-weight: 700; }
.article-body em { color: var(--fg); font-style: italic; }
.article-body a { color: var(--brand); border-bottom: 1px solid var(--brand-subtle); transition: border-color .15s; }
.article-body a:hover { border-bottom-color: var(--brand); }
.article-body ul, .article-body ol { padding-left: 1.3em; margin-top: 1.1em; }
.article-body li { margin-bottom: .5em; }
.article-body ul li::marker { color: var(--accent); }
.article-body hr {
  border: none; height: 1px;
  background: var(--border);
  margin: 3em 0;
  position: relative;
}
.article-body hr::after {
  content: '§';
  position: absolute; left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg);
  padding: 0 12px;
  font-family: var(--font-display);
  color: var(--fg-subtle);
  font-size: 1.2rem;
  letter-spacing: .2em;
}

.pull-quote {
  margin: 2em 0;
  padding: 28px 0 28px 32px;
  border-left: 3px solid var(--accent);
  font-family: var(--font-display);
  font-size: 1.45rem;
  line-height: 1.35;
  font-weight: 500;
  letter-spacing: -.015em;
  color: var(--fg);
}
.pull-quote cite {
  display: block;
  margin-top: 14px;
  font-family: var(--font-body);
  font-size: .82rem;
  font-weight: 500;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--fg-muted);
  font-style: normal;
}

.figure {
  margin: 2.4em 0;
}
.figure-frame {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-lg);
  background:
    repeating-linear-gradient(45deg, rgba(31,97,255,.06) 0 14px, rgba(31,97,255,.12) 14px 15px),
    linear-gradient(135deg, var(--brand-subtle) 0%, var(--accent-subtle) 100%);
  border: 1px solid var(--border);
  position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.figure-frame::after {
  content: '';
  position: absolute; inset: 10%;
  background:
    linear-gradient(180deg, transparent 0%, rgba(13,4,7,.04) 100%);
  border-radius: var(--radius-md);
}
.figure-frame .fig-ico {
  position: relative; z-index: 1;
  font-size: 56px; color: var(--brand);
  opacity: .55;
}
.figure-frame .fig-label {
  position: absolute; top: 18px; left: 18px;
  font-family: var(--font-display);
  font-size: .68rem; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase;
  color: var(--brand);
  background: var(--bg-elevated);
  padding: 5px 10px; border-radius: var(--radius-full);
  border: 1px solid var(--border);
}
.figure-cap {
  margin-top: 14px;
  font-size: .88rem;
  color: var(--fg-muted);
  line-height: 1.55;
  display: flex; gap: 10px;
}
.figure-cap .fc-num {
  font-family: var(--font-display);
  font-weight: 700; font-size: .74rem;
  color: var(--accent);
  letter-spacing: .1em; text-transform: uppercase;
  flex-shrink: 0;
  padding-top: 1px;
}

.callout {
  margin: 2em 0;
  padding: 24px 28px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-left: 4px solid var(--brand);
  border-radius: var(--radius-md);
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 14px;
  align-items: start;
}
.callout i {
  color: var(--brand);
  font-size: 22px;
  margin-top: 2px;
}
.callout strong {
  font-family: var(--font-display);
  font-weight: 700;
  display: block;
  margin-bottom: 6px;
}
.callout p {
  font-size: .94rem !important;
  line-height: 1.6 !important;
  color: var(--fg-muted) !important;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 2em 0;
  padding: 28px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.stat-row .sr-cell .n {
  font-family: var(--font-display);
  font-size: 2.2rem; font-weight: 700;
  letter-spacing: -.02em; color: var(--fg);
  line-height: 1;
}
.stat-row .sr-cell .n em {
  color: var(--accent); font-style: normal;
}
.stat-row .sr-cell .l {
  font-size: .82rem; color: var(--fg-muted);
  margin-top: 8px; line-height: 1.4;
}

.footnotes {
  margin-top: 3em;
  padding-top: 28px;
  border-top: 1px dashed var(--border);
  font-size: .88rem;
  color: var(--fg-muted);
  line-height: 1.6;
}
.footnotes h4 {
  font-family: var(--font-display);
  font-size: .74rem; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase;
  color: var(--fg-subtle);
  margin-bottom: 14px;
}
.footnotes ol { padding-left: 1.4em; }
.footnotes li { margin-bottom: .7em; }

/* Article end: author bio */
.article-author-bio {
  max-width: 920px;
  margin: 0 auto;
  padding: 48px var(--space-8);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 24px;
  align-items: start;
}
.article-author-bio .bio-avatar {
  width: 96px; height: 96px; border-radius: 50%;
  background: linear-gradient(135deg, #1f61ff 0%, #4d7eff 100%);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-weight: 700; font-size: 1.7rem;
  flex-shrink: 0;
}
.article-author-bio .bio-text .bio-label {
  font-family: var(--font-display);
  font-size: .7rem; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase;
  color: var(--fg-subtle);
  margin-bottom: 8px;
}
.article-author-bio .bio-text h4 {
  font-family: var(--font-display);
  font-size: 1.35rem; font-weight: 700;
  letter-spacing: -.02em;
  color: var(--fg);
  margin-bottom: 6px;
}
.article-author-bio .bio-text .bio-role {
  font-size: .92rem; color: var(--fg-muted);
  margin-bottom: 14px;
}
.article-author-bio .bio-text p {
  font-size: .98rem; color: var(--fg);
  line-height: 1.65;
  max-width: 62ch;
  margin-bottom: 16px;
}
.article-author-bio .bio-links {
  display: flex; gap: 18px; flex-wrap: wrap;
  font-family: var(--font-display);
  font-size: .85rem; font-weight: 600;
}
.article-author-bio .bio-links a {
  display: inline-flex; align-items: center; gap: 6px;
  color: var(--fg-muted);
}
.article-author-bio .bio-links a:hover { color: var(--brand); }

/* Related */
.article-related {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 56px var(--space-8) 96px;
}
.article-related h3 {
  font-family: var(--font-display);
  font-size: 1.3rem; font-weight: 700;
  letter-spacing: -.015em;
  color: var(--fg);
  margin-bottom: 24px;
}

@media (max-width: 980px) {
  .article-body-wrap { grid-template-columns: 1fr; gap: 32px; }
  .article-toc { position: static; border-left: none; border-top: 2px solid var(--border); padding-top: 16px; max-height: none; }
  .article-toc .toc-label { padding-left: 0; }
  .article-toc a { padding-left: 0; border-left: none; }
  .article-toc a.active { border-left: none; background: var(--brand-subtle); padding-left: 12px; border-radius: var(--radius-md); }
  .article-author-bio { grid-template-columns: 1fr; text-align: left; }
  .stat-row { grid-template-columns: 1fr; gap: 16px; }
}
</style>

<article class="article">
  <header class="article-top">
    <div class="article-breadcrumb">
      <a href="#" onclick="goto('documents');return false;">Documents</a>
      <span class="sep">/</span>
      <a href="#" onclick="goto('documents','blogs');return false;">Blogs</a>
      <span class="sep">/</span>
      <span class="curr">Research</span>
    </div>
    <span class="article-tag">Research</span>
    <h1 class="article-title">What WCAG misses — and how we test for it.</h1>
    <p class="article-standfirst">Two years of field research across four countries, 312 users, and 41 assistive-technology configurations. The guidelines get you to the door. They don't get you inside.</p>

    <div class="article-byline">
      <div class="article-byline-author">
        <div class="article-byline-avatar">RN</div>
        <div class="article-byline-who">
          <div class="name">Dr. Rhea Nair</div>
          <div class="role">Head of Research · Third Eye Worldwide</div>
        </div>
      </div>
      <div class="article-byline-meta">
        <span class="mi"><i class="ph ph-calendar-blank"></i> April 14, 2026</span>
        <span class="mi"><i class="ph ph-clock"></i> 12 min read</span>
        <span class="mi"><i class="ph ph-speaker-high"></i> Listen · 14:32</span>
      </div>
      <div class="article-share" role="group" aria-label="Share this article">
        <button aria-label="Copy link"><i class="ph ph-link-simple"></i></button>
        <button aria-label="Share to LinkedIn"><i class="ph ph-linkedin-logo"></i></button>
        <button aria-label="Share to X"><i class="ph ph-x-logo"></i></button>
        <button aria-label="Save"><i class="ph ph-bookmark-simple"></i></button>
      </div>
    </div>
  </header>

  <div class="article-hero-vis">
    <div class="article-hero-image" aria-hidden="true">
      <div class="ahi-fig">
        <svg viewBox="0 0 220 257.57" fill="currentColor">
          <path d="M212.24,8.45c-5.74-5.63-13.38-8.45-22.94-8.45H0v57.17c13.39-5.17,28.43-8.08,44.32-8.08,32.4,0,61.24,12.06,79.89,30.85,3.56,3.59,3.56,9.32,0,12.9-18.65,18.79-47.49,30.86-79.89,30.86-5.32,0-10.54-.33-15.64-.96-10.14-1.24-19.77-3.69-28.68-7.13v108.45c0,9.77,2.86,17.47,8.6,23.11,5.74,5.63,13.38,8.45,22.94,8.45h189.29v-57.17c-13.4,5.17-28.43,8.08-44.32,8.08-32.4,0-61.25-12.06-79.89-30.85-3.56-3.59-3.56-9.32,0-12.9,18.64-18.79,47.49-30.86,79.89-30.86,5.32,0,10.54.33,15.64.96,10.13,1.24,19.76,3.69,28.68,7.13V31.55c0-9.77-2.86-17.48-8.6-23.11Z"/>
        </svg>
      </div>
      <span class="ahi-badge"><i class="ph ph-flask"></i> Third Eye Research · Vol. 04</span>
    </div>
    <p class="article-hero-caption">Illustration: The TEWW research team visited field sites in Nairobi, Mumbai, São Paulo, and Cairo over 18 months.</p>
  </div>

  <div class="article-body-wrap">
    <aside class="article-toc" aria-label="Table of contents">
      <div class="toc-label">On this page</div>
      <ol>
        <li><a href="#s1" class="active">The audit paradox</a></li>
        <li><a href="#s2">What the spec assumes</a></li>
        <li><a href="#s3">Five failure modes</a></li>
        <li><a href="#s4">A field-first methodology</a></li>
        <li><a href="#s5">What changes on Monday</a></li>
        <li><a href="#s6">References</a></li>
      </ol>
    </aside>

    <div class="article-body">
      <p class="deck">In the fall of 2024 we shipped a product update that passed WCAG 2.2 AA with a clean audit. Three weeks later, a user in Nairobi told us she had given up on our app. Her phone was three years old. Her screen reader was an older fork. Our "compliant" update had broken her workflow in four places the audit could not see.</p>

      <p>This is a story we have now heard 89 times in 18 months of field research. It is not a story about bad engineers or careless designers. It is a story about a standard that was written for a different set of conditions than the ones most of our users actually live in.</p>

      <p>This essay is our attempt to describe the gap — and what we have started doing about it.</p>

      <h2 id="s1">The audit paradox</h2>
      <p>The Web Content Accessibility Guidelines are, by every reasonable measure, a remarkable achievement. They have given an entire industry a shared vocabulary, a procurement checklist, and a legal floor. Most of the wins of the last decade — captions, alt text, keyboard nav, color-contrast baselines — exist because WCAG made them measurable.</p>

      <p>But <em>measurable</em> has a cost. The parts of accessibility that translate cleanly into unit tests are a fraction of the parts that matter. And the economic logic of audits pushes teams to optimise for the measurable part and stop there.</p>

      <blockquote class="pull-quote">
        Every team we interviewed could cite their WCAG score. Only two in thirty-one could describe what their lowest-end user actually experienced on a given Tuesday.
        <cite>— TEWW Field Team, Internal Report 04.2</cite>
      </blockquote>

      <p>This is the audit paradox: the score goes up; the experience doesn't. We've seen products with AAA scores that real screen-reader users abandon after the first session, and products with imperfect scores that users adopt and never leave.</p>

      <h2 id="s2">What the spec assumes</h2>
      <p>The 2.2 spec, read charitably, assumes a roughly modern browser, a roughly modern assistive tech stack, a reliable network, and a user who can productively solve small frictions on their own. None of these are guaranteed in the conditions we build for.</p>

      <div class="stat-row" role="list">
        <div class="sr-cell" role="listitem">
          <div class="n"><em>61%</em></div>
          <div class="l">of our users run a screen reader more than two major versions behind the current release</div>
        </div>
        <div class="sr-cell" role="listitem">
          <div class="n"><em>3.4s</em></div>
          <div class="l">median time-to-first-announce on a mid-tier Android phone, 3G — vs. 0.4s on a benchmark desktop</div>
        </div>
        <div class="sr-cell" role="listitem">
          <div class="n"><em>1 in 4</em></div>
          <div class="l">sessions involves at least one pause longer than 30s caused by connectivity, not the interface</div>
        </div>
      </div>

      <p>These are not exotic users. They are the median of the global population we work with, and they are mostly invisible to tooling built in Mountain View or Berlin.</p>

      <h2 id="s3">Five failure modes</h2>
      <p>When we reviewed the 312 session transcripts from our field work, five failure modes accounted for 74% of the usability breakdowns — and none of them show up reliably on an audit.</p>

      <h3>1. Stale-ARIA drift</h3>
      <p>Dynamic attributes (<code>aria-expanded</code>, <code>aria-live</code>) get updated by JavaScript that runs on the assumption the announcement will land before the next user input. On slower stacks, it often doesn't. Users act on a state the UI has already moved past.</p>

      <h3>2. Focus mid-flight</h3>
      <p>Modals, drawers, and toasts move focus deliberately. When network or animation delays that move, the user's next keystroke lands in the old context. The audit sees the correct focus-management code; the user sees keys going nowhere.</p>

      <h3>3. Invisible semantic drift</h3>
      <p>Frameworks ship updates that re-order DOM in ways that pass contrast and role checks but change the reading order the screen reader follows. The user re-learns the product weekly without anyone on the team noticing.</p>

      <div class="figure">
        <div class="figure-frame">
          <span class="fig-label">Fig. 01</span>
          <i class="ph ph-chart-line fig-ico"></i>
        </div>
        <div class="figure-cap">
          <span class="fc-num">Fig. 01</span>
          <span>Abandonment rate vs. WCAG audit score, across 41 products in our benchmark set. The correlation is not what you'd expect — and the correlation with our field-usability score is stronger by a factor of 3.2.</span>
        </div>
      </div>

      <h3>4. Implicit literacy</h3>
      <p>Guidelines do not require that the language of a button make sense in the user's vocabulary. "Dismiss," "Authenticate," "Verify" are all technically accessible and practically opaque to users whose second or third language is the interface language.</p>

      <h3>5. The cold-start cliff</h3>
      <p>Products are tested on warm caches and configured assistive tech. Real sessions often begin cold: new device, fresh install, first-run assistive-tech pairing. The first ninety seconds are the most accessibility-hostile window in the entire product — and they are almost never tested.</p>

      <div class="callout">
        <i class="ph-fill ph-warning-circle"></i>
        <div>
          <strong>If you take one thing from this piece</strong>
          <p>Audit once. Then watch a user you have never met open your product on a phone you would not use. The delta between those two experiences is your real accessibility debt.</p>
        </div>
      </div>

      <h2 id="s4">A field-first methodology</h2>
      <p>We have spent the last year codifying a research methodology we call <strong>field-first</strong>. It does not replace WCAG; it starts where WCAG stops. The full protocol is published in our <a href="#">open-access research library</a>, but the shape of it is simple:</p>

      <ul>
        <li><strong>Observe before measuring.</strong> Every product cycle starts with a week of passive session recordings on real devices in real homes, not labs.</li>
        <li><strong>Recruit the long tail.</strong> Our panel deliberately over-indexes on older hardware, older AT versions, and multilingual users. The panel's median device age is 3.2 years.</li>
        <li><strong>Score the friction, not the compliance.</strong> We track time-to-task, dead-key events, and recovery rate. WCAG checks come <em>after</em> these.</li>
        <li><strong>Ship the artefact, not the memo.</strong> Every field study ends with a working fix checked into a public repo, plus a fifteen-minute video a non-specialist engineer can watch before standup.</li>
      </ul>

      <p>This is slower than an audit. It is also immeasurably more useful, and after twelve months we have enough data to say that with some confidence.</p>

      <blockquote class="pull-quote">
        Compliance is the floor. Dignity is the ceiling. The gap between them is where most products live — and where our users still can't.
        <cite>— Principle 04, TEWW Research Charter</cite>
      </blockquote>

      <h2 id="s5">What changes on Monday</h2>
      <p>This piece is long on critique; the team I lead tries to be short on it in daily practice. If you are a designer, engineer, or PM reading this, here is what we would ask you to do this week, in order of cost:</p>

      <ol>
        <li>Open your product on a phone older than your current one. Take ten screenshots of things that are harder than you remembered.</li>
        <li>Pair with a colleague who uses your product differently than you do. Narrate. Don't fix. Listen.</li>
        <li>Pick one of the five failure modes above and write a test for it. One. Check it in. Do it again next week.</li>
        <li>Publish the test. The field is small and the stakes are large; our progress compounds when we share.</li>
      </ol>

      <p>None of this replaces a formal audit. All of it will catch things a formal audit never will.</p>

      <hr/>

      <p>If you want to talk about any of this — disagreement especially welcome — I am reachable at <a href="#">rhea@thirdeyeworldwide.org</a>. Everything in this essay reflects the work of a team far larger than me; the errors are mine.</p>

      <div class="footnotes">
        <h4 id="s6">References &amp; notes</h4>
        <ol>
          <li>TEWW Field Research Cohort, Q1 2024 – Q1 2026. 312 participants across Kenya, India, Brazil, and Egypt. Method appendix in research library.</li>
          <li>Benchmark set of 41 consumer applications, sampled for WCAG 2.2 audit presence. Audit scores self-reported; usability scores measured in field.</li>
          <li>The five failure modes emerged from open coding of session transcripts by three coders; inter-rater agreement <em>κ</em> = 0.81.</li>
          <li>Screen-reader version data drawn from telemetry with user consent; ≥ 2 major versions behind defined against WAI-ARIA Authoring Practices 1.2 at time of study.</li>
        </ol>
      </div>
    </div>
  </div>
</article>

<div class="article-author-bio">
  <div class="bio-avatar">RN</div>
  <div class="bio-text">
    <div class="bio-label">Written by</div>
    <h4>Dr. Rhea Nair</h4>
    <div class="bio-role">Head of Research · Third Eye Worldwide · based in Bengaluru</div>
    <p>Rhea leads the Research team at TEWW. Before joining in 2025, she spent eight years at the Centre for Internet and Society studying assistive-tech adoption in low-infrastructure contexts. She writes here roughly monthly.</p>
    <div class="bio-links">
      <a href="#"><i class="ph ph-envelope-simple"></i> Email</a>
      <a href="#"><i class="ph ph-linkedin-logo"></i> LinkedIn</a>
      <a href="#"><i class="ph ph-file-text"></i> Publications</a>
      <a href="#" onclick="goto('documents','blogs');return false;"><i class="ph ph-books"></i> All posts</a>
    </div>
  </div>
</div>

<section class="article-related">
  <h3>Keep reading</h3>
  <div class="doc-grid">
    ${typeof doc === 'function' ? doc('','type-report','report','Research','research','Measuring digital independence','A new framework for evaluating assistive-tech impact — developed across four field sites.','Dr. Rhea Nair','DR','15 min · Mar 28') : ''}
    ${typeof doc === 'function' ? doc('','type-blog','blog','Engineering','engineering','Shipping an offline-first screen reader','Why our latest release works with zero data, and how we got there.','Priya Sharma','PS','8 min · Mar 22') : ''}
    ${typeof doc === 'function' ? doc('','type-policy','policy','Policy','policy','Inside the EU Accessibility Act','What the 2025 deadline means for every digital service in Europe.','Fatima Al-Harbi','FA','9 min · Apr 3') : ''}
  </div>
  <div style="display:flex;justify-content:center;margin-top:36px;">
    <button class="btn-secondary" onclick="goto('documents','blogs')"><i class="ph ph-arrow-left"></i> Back to all posts</button>
  </div>
</section>
`;
}

// Scrollspy for the TOC (runs whenever an article renders)
(function () {
  if (window.__articleTocWired) return;
  window.__articleTocWired = true;

  function updateActive() {
    const toc = document.querySelector('.article-toc');
    if (!toc) return;
    const links = toc.querySelectorAll('a[href^="#"]');
    if (!links.length) return;
    const y = window.scrollY + 140;
    let activeId = null;
    links.forEach(a => {
      const id = a.getAttribute('href').slice(1);
      const t = document.getElementById(id);
      if (!t) return;
      if (t.offsetTop <= y) activeId = id;
    });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + activeId));
  }
  let rafPending = false;
  window.addEventListener('scroll', () => {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => { rafPending = false; updateActive(); });
  });
})();
