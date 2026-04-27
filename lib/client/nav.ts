/**
 * Mobile-nav open/close DOM helpers, shared between the React
 * `NavProvider` and the legacy `window.*` helpers.
 *
 * Per MED-6. The burger glyph is now rendered from React state in
 * components/Nav.tsx (since MED-5 PR 2a) — these helpers no longer
 * mutate `burger.innerHTML`. Aria + classlist mutations stay so
 * legacy HTML routes that don't share React state still get sane
 * behavior when they call window.openNav / closeNav.
 */

export function openNav(): void {
  if (typeof document === 'undefined') return;
  const links = document.getElementById('primary-nav');
  const burger = document.getElementById('nav-burger');
  if (!links || !burger) return;
  links.classList.add('open');
  burger.setAttribute('aria-expanded', 'true');
  burger.setAttribute('aria-label', 'Close navigation menu');
  document.body.classList.add('nav-open');
}

export function closeNav(): void {
  if (typeof document === 'undefined') return;
  const links = document.getElementById('primary-nav');
  const burger = document.getElementById('nav-burger');
  if (!links || !links.classList.contains('open')) return;
  links.classList.remove('open');
  if (burger) {
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open navigation menu');
  }
  document.body.classList.remove('nav-open');
}

export function toggleNav(): void {
  if (typeof document === 'undefined') return;
  const links = document.getElementById('primary-nav');
  if (!links) return;
  if (links.classList.contains('open')) closeNav();
  else openNav();
}

export function isNavOpen(): boolean {
  if (typeof document === 'undefined') return false;
  return !!document.getElementById('primary-nav')?.classList.contains('open');
}
