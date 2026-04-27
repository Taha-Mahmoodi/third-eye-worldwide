import { iconSvg } from '@/lib/pages/icon-svg';
import type { SiteContent } from '@/lib/types';

/**
 * Founder's Series template — modified first-person variant of the
 * story-detail template. Used for memoir excerpts at
 *   /story-detail?slug=<chapter-slug>
 *
 * Shape pulled from data/seed.json under `documents.book.chapters[]`.
 * If a chapter has no `body` yet, we render the snippet + an
 * "Excerpt coming soon" placeholder. The series-list sidebar always
 * shows all 6 chapters so the reader can move between them.
 *
 * Per teww-cms-content-update-v2.md "Story Detail / founder series":
 *   - eyebrow: "About / Founder's Series"
 *   - tag:     "Founder's Series · [N] min"
 *   - byline:  "SM · Said Mohaddes Sadeqi · Founder"
 *   - sidebar: replaces "Subject" with series navigation
 *   - about:   replaces "What TEWW Provides" with "About this series"
 *   - editor's note + author footer per v2 spec
 */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};
function _esc(s: unknown): string {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c);
}

export interface BookChapter {
  id?: string;
  num?: string;
  title?: string;
  readTime?: string;
  status?: string;
  snippet?: string;
  body?: string;
  slug?: string;
  visible?: boolean;
}

interface BookContent {
  chapters?: BookChapter[];
}

const FOUNDER_SLUGS = new Set([
  'airport',
  'the-room',
  'the-little-boy',
  'dreams-light',
  'blindness-language',
  'boiled-potato',
]);

export function isFounderSeriesSlug(slug: string | undefined): boolean {
  if (!slug) return false;
  return FOUNDER_SLUGS.has(slug);
}

export function renderFounderChapter(
  content: SiteContent | null | undefined,
  slug?: string,
): string {
  const docs = (content?.documents || {}) as { book?: BookContent };
  const chapters = (docs.book?.chapters || []).filter((c) => c?.visible !== false);
  const chapter =
    (slug && chapters.find((c) => c.slug === slug || c.id === slug)) ||
    chapters[0] ||
    {};

  const num = _esc(chapter.num || '01');
  const title = _esc(chapter.title || 'Chapter');
  const readTime = _esc(chapter.readTime || '5 min');
  const snippet = _esc(chapter.snippet || '');
  const body = chapter.body && String(chapter.body).trim().length > 0
    ? String(chapter.body)
    : '';

  // Series-list sidebar — six chapters, current one highlighted.
  const seriesList = chapters
    .map((c) => {
      const isCurrent = c.slug === chapter.slug;
      const cls = isCurrent ? 'fs-side-item active' : 'fs-side-item';
      const label = `${_esc(c.num || '')} · ${_esc(c.title || '')}`;
      const href = `/story-detail?slug=${encodeURIComponent(c.slug || c.id || '')}`;
      return `<li class="${cls}"><a href="${href}">${label}</a></li>`;
    })
    .join('');

  return `
<style>
.fs {
  background: var(--bg);
  color: var(--fg);
}
.fs-top {
  max-width: 760px;
  margin: 0 auto;
  padding: 56px var(--space-8) 32px;
}
.fs-breadcrumb {
  display: inline-flex; align-items: center; gap: 10px;
  font-family: var(--font-display);
  font-size: .72rem; font-weight: 600;
  letter-spacing: .14em; text-transform: uppercase;
  color: var(--fg-muted);
  margin-bottom: 28px;
}
.fs-breadcrumb a { color: var(--fg-muted); }
.fs-breadcrumb a:hover { color: var(--brand); }
.fs-breadcrumb .sep { color: var(--fg-subtle); font-weight: 400; }
.fs-breadcrumb .curr { color: var(--fg); }

.fs-tag {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 12px;
  background: var(--accent-subtle, var(--brand-subtle));
  color: var(--accent);
  font-family: var(--font-display);
  font-size: .72rem; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase;
  border-radius: var(--radius-full);
  margin-bottom: 22px;
}

.fs-num {
  font-family: var(--font-display);
  font-size: .82rem; font-weight: 700;
  letter-spacing: .14em; color: var(--accent);
  margin-bottom: 10px;
}

.fs-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4.4vw, 3.2rem);
  font-weight: 700; letter-spacing: -.035em;
  line-height: 1.1; color: var(--fg);
  margin-bottom: 22px;
  text-wrap: balance; max-width: 22ch;
}
.fs-title em { font-style: italic; color: var(--brand); }

.fs-standfirst {
  font-family: var(--font-display);
  font-size: clamp(1.05rem, 1.55vw, 1.3rem);
  font-weight: 400; color: var(--fg-muted);
  line-height: 1.5; letter-spacing: -.012em;
  max-width: 64ch; margin-bottom: 36px;
}

.fs-byline {
  display: flex; align-items: center; gap: 14px;
  padding: 22px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.fs-byline-avatar {
  width: 46px; height: 46px; border-radius: 50%;
  background: linear-gradient(135deg, #1f61ff 0%, #4d7eff 100%);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-weight: 700; font-size: .9rem;
  flex-shrink: 0;
}
.fs-byline-who .name {
  font-family: var(--font-display);
  font-weight: 600; font-size: .95rem; color: var(--fg);
}
.fs-byline-who .role {
  font-size: .78rem; color: var(--fg-muted);
  margin-top: 3px;
}
.fs-byline-meta {
  margin-left: auto;
  font-family: var(--font-display);
  font-size: .78rem; color: var(--fg-muted);
  display: inline-flex; align-items: center; gap: 6px;
}
.fs-byline-meta svg { color: var(--fg-subtle); }

.fs-body-wrap {
  max-width: var(--maxw);
  margin: 56px auto 0;
  padding: 0 var(--space-8) 80px;
  display: grid;
  grid-template-columns: 220px 1fr 240px;
  gap: 56px;
  align-items: start;
}

.fs-side-nav, .fs-side-about {
  position: sticky; top: 92px;
  font-family: var(--font-display);
  font-size: .82rem; line-height: 1.5;
}
.fs-side-nav .label, .fs-side-about .label {
  font-size: .68rem; font-weight: 700;
  letter-spacing: .16em; text-transform: uppercase;
  color: var(--fg-subtle);
  margin-bottom: 14px;
}
.fs-side-nav ol {
  list-style: none; padding: 0; margin: 0;
  border-left: 2px solid var(--border);
}
.fs-side-nav .fs-side-item {
  padding: 10px 0 10px 18px;
  margin-left: -2px;
  border-left: 2px solid transparent;
  transition: border-color .15s, color .15s;
}
.fs-side-nav .fs-side-item.active {
  border-left-color: var(--brand);
}
.fs-side-nav .fs-side-item.active a {
  color: var(--brand); font-weight: 600;
}
.fs-side-nav a {
  color: var(--fg-muted); font-weight: 500;
  display: block;
}
.fs-side-nav a:hover { color: var(--fg); }

.fs-side-about {
  padding: 18px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: .9rem; line-height: 1.55;
  color: var(--fg-muted);
}
.fs-side-about strong { color: var(--fg); display: block; margin-bottom: 8px; }
.fs-side-about a { color: var(--brand); }

.fs-body {
  max-width: 680px;
  font-size: 1.08rem;
  line-height: 1.75;
  color: var(--fg);
}
.fs-body > * + * { margin-top: 1.2em; }
.fs-body p { color: var(--fg); font-family: var(--font-body); }
.fs-body p.deck {
  font-family: var(--font-display);
  font-size: 1.22rem; font-weight: 500;
  line-height: 1.5; letter-spacing: -.01em;
  color: var(--fg);
}
.fs-body em { color: var(--fg); font-style: italic; }
.fs-body strong { color: var(--fg); font-weight: 700; }
.fs-body hr {
  border: none; height: 1px;
  background: var(--border);
  margin: 3em 0; position: relative;
}
.fs-body hr::after {
  content: '§ § §';
  position: absolute; left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg);
  padding: 0 12px;
  font-family: var(--font-display);
  color: var(--fg-subtle);
  font-size: .9rem; letter-spacing: .4em;
}

.fs-status {
  margin: 2em 0;
  padding: 24px 28px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-left: 4px solid var(--accent);
  border-radius: var(--radius-md);
  font-size: .94rem; line-height: 1.6;
  color: var(--fg-muted);
}
.fs-status strong { color: var(--fg); }

.fs-editor-note {
  margin: 3em 0 1.5em;
  padding-top: 24px;
  border-top: 1px dashed var(--border);
  font-size: .92rem; line-height: 1.65;
  color: var(--fg-muted);
}
.fs-editor-note strong { color: var(--fg); }

.fs-author {
  max-width: 760px;
  margin: 0 auto;
  padding: 48px var(--space-8);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.fs-author .label {
  font-family: var(--font-display);
  font-size: .7rem; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase;
  color: var(--fg-subtle);
  margin-bottom: 8px;
}
.fs-author h4 {
  font-family: var(--font-display);
  font-size: 1.35rem; font-weight: 700;
  letter-spacing: -.02em; color: var(--fg);
  margin-bottom: 12px;
}
.fs-author p {
  font-size: .98rem; color: var(--fg);
  line-height: 1.65; max-width: 62ch;
}

.fs-foot {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 48px var(--space-8) 80px;
  display: flex; gap: 14px; flex-wrap: wrap; justify-content: center;
}

@media (max-width: 980px) {
  .fs-body-wrap { grid-template-columns: 1fr; gap: 32px; }
  .fs-side-nav, .fs-side-about { position: static; }
  .fs-side-nav ol { border-left: none; border-top: 2px solid var(--border); padding-top: 12px; }
  .fs-side-nav .fs-side-item { border-left: none; padding-left: 0; }
  .fs-side-nav .fs-side-item.active a { border-left: 3px solid var(--brand); padding-left: 10px; }
}
</style>

<article class="fs">
  <header class="fs-top">
    <div class="fs-breadcrumb">
      <a href="/about/#founders-series">About</a>
      <span class="sep">/</span>
      <span class="curr">Founder's Series</span>
    </div>

    <span class="fs-tag">${iconSvg('books')} Founder's Series · ${readTime}</span>

    <div class="fs-num">Chapter ${num}</div>
    <h1 class="fs-title">${title}</h1>
    ${snippet ? `<p class="fs-standfirst">${snippet}</p>` : ''}

    <div class="fs-byline">
      <div class="fs-byline-avatar">SM</div>
      <div class="fs-byline-who">
        <div class="name">Said Mohaddes Sadeqi</div>
        <div class="role">Founder · Third Eye Worldwide</div>
      </div>
      <span class="fs-byline-meta">${iconSvg('clock')} ${readTime}</span>
    </div>
  </header>

  <div class="fs-body-wrap">
    <aside class="fs-side-nav" aria-label="Series navigation">
      <div class="label">Founder's Series · ${chapters.length} pieces</div>
      <ol>${seriesList}</ol>
    </aside>

    <div class="fs-body">
      ${body
        ? body
        : `<div class="fs-status">
             <strong>Excerpt coming soon</strong>
             <p>This chapter is being finalised. ${snippet ? snippet + ' ' : ''}When the excerpt publishes, it will appear here.</p>
           </div>`
      }
      <div class="fs-editor-note">
        <strong>Editor's note —</strong> This piece is adapted from
        <em>The Third Eye</em>, a memoir by Said Mohaddes Sadeqi. The
        book is in progress; an early excerpt is published here with
        the author's permission.
      </div>
    </div>

    <aside class="fs-side-about">
      <strong>About this series</strong>
      These are excerpts from a memoir-in-progress, adapted with the
      author's permission. They do not represent the typical work of
      Third Eye Worldwide — for that, read our
      <a href="/documents/#stories">community stories</a>.
    </aside>
  </div>

  <section class="fs-author">
    <div class="label">Written by</div>
    <h4>Said Mohaddes Sadeqi</h4>
    <p>
      Said Mohaddes Sadeqi is the founder and president of Third Eye
      Worldwide. He is a visually impaired engineer and educator.
      <em>The Third Eye</em>, his memoir, is in progress.
    </p>
  </section>

  <div class="fs-foot">
    <a class="btn-secondary" href="/about/#founders-series">${iconSvg('arrow-left')} Back to the series</a>
    <a class="btn-secondary" href="/documents/#book">Open the Book tab</a>
  </div>
</article>
`;
}
