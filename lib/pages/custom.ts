import { visibleSorted } from '@/lib/cms/db';
import { esc, rich } from '@/lib/pages/_helpers';
import type { CmsCustomPage, CmsPageSection, SiteContent } from '@/lib/types';

// Find a CMS-defined page by slug. Returns null if missing or hidden.
export function findCustomPage(content: SiteContent | null | undefined, slug: string): CmsCustomPage | null {
  const pages = Array.isArray(content?.pages) ? content!.pages! : [];
  const p = pages.find((x) => x && x.slug === slug);
  if (!p) return null;
  if (p.visible === false) return null;
  return p;
}

// Each page has an ordered list of sections; section types supported below.
// Any extension just adds another case here + a matching editor form in the CMS.
function renderSection(sec: CmsPageSection | null | undefined): string {
  if (!sec || sec.visible === false) return '';
  const type = sec.type || 'rich';
  switch (type) {
    case 'hero':
      return `<div class="page-hero">
        <div class="page-hero-inner">
          ${sec.eyebrow ? `<div class="section-eyebrow">${esc(sec.eyebrow)}</div>` : ''}
          ${sec.title ? `<h1>${rich(sec.title)}</h1>` : ''}
          ${sec.body ? `<p>${esc(sec.body)}</p>` : ''}
        </div>
      </div>`;
    case 'text':
      return `<section class="section">
        <div class="section-inner" style="max-width:820px;">
          ${sec.heading ? `<div class="section-heading left"><h2 class="section-title">${esc(sec.heading)}</h2></div>` : ''}
          <div class="cms-prose" style="font-size:1.02rem;color:var(--fg-muted);line-height:1.75;">
            ${esc(sec.body || '').split(/\n\n+/).map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('')}
          </div>
        </div>
      </section>`;
    case 'rich':
      // Author-trusted HTML block. The CMS presents this with a warning.
      return `<section class="section">
        <div class="section-inner" style="max-width:900px;">${rich(sec.html || '')}</div>
      </section>`;
    case 'cta':
      return `<section class="cta-band">
        <div class="cta-inner">
          ${sec.heading ? `<h2>${esc(sec.heading)}</h2>` : ''}
          ${sec.body ? `<p>${esc(sec.body)}</p>` : ''}
          <div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;">
            ${sec.primaryLabel ? `<a class="btn-accent" href="${esc(sec.primaryHref || '#')}"><i class="ph-fill ph-heart"></i> ${esc(sec.primaryLabel)}</a>` : ''}
            ${sec.secondaryLabel ? `<a class="btn-secondary" href="${esc(sec.secondaryHref || '#')}">${esc(sec.secondaryLabel)}</a>` : ''}
          </div>
        </div>
      </section>`;
    default:
      return '';
  }
}

export function renderCustomPage(page: CmsCustomPage | null | undefined): string {
  const sections = visibleSorted<CmsPageSection>(page?.sections || []);
  return sections.map(renderSection).join('\n');
}
