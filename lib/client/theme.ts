/**
 * Theme + text-size apply helpers used by both the React Context
 * (via `lib/context/theme-context.tsx`) and the legacy `window.*`
 * helpers in `ClientBootstrap.tsx`. Keeping the underlying mutators
 * here means React and non-React callers can't drift in behavior.
 *
 * Per MED-6 in CODEBASE_REVIEW.md.
 */

export type Theme = 'light' | 'dark' | 'high-contrast';
export const THEMES: readonly Theme[] = ['light', 'dark', 'high-contrast'] as const;

export type TextSize = 'a' | 'a-plus' | 'a-plus-plus';
export const TEXT_SIZES: readonly TextSize[] = ['a', 'a-plus', 'a-plus-plus'] as const;

const THEME_ICONS: Record<Theme, string> = {
  light: 'ph-sun',
  dark: 'ph-moon',
  'high-contrast': 'ph-circle-half',
};

const THEME_KEY = 'teww-theme';
const SIZE_KEY = 'teww-size';

export function isTheme(t: unknown): t is Theme {
  return typeof t === 'string' && (THEMES as readonly string[]).includes(t);
}
export function isTextSize(s: unknown): s is TextSize {
  return typeof s === 'string' && (TEXT_SIZES as readonly string[]).includes(s);
}

/** Apply a theme: set the document attribute, update the theme-button
 *  glyph, swap logo assets, persist to localStorage. */
export function applyTheme(t: Theme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', t);

  // Theme-button icon (the small sun/moon at the top of the page)
  const btn = document.getElementById('theme-btn');
  if (btn) btn.innerHTML = `<i class="ph ${THEME_ICONS[t]}"></i>`;

  // Old asset-driven logos (still present on legacy HTML routes).
  // The new inline SVG logo respects var(--brand)/var(--accent), so
  // it doesn't need a swap.
  const brandLogo = document.getElementById('brand-logo') as HTMLImageElement | null;
  const footerLogo = document.getElementById('footer-logo') as HTMLImageElement | null;
  const dark = t !== 'light';
  if (brandLogo) brandLogo.src = dark ? '/assets/logo-light.svg' : '/assets/logo.svg';
  if (footerLogo) footerLogo.src = '/assets/logo-light.svg';

  try { localStorage.setItem(THEME_KEY, t); } catch {}
}

export function nextTheme(current: Theme): Theme {
  const idx = THEMES.indexOf(current);
  return THEMES[(idx + 1) % THEMES.length];
}

/** Read persisted theme from localStorage, falling back to 'light'. */
export function readPersistedTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'light';
  try {
    const t = localStorage.getItem(THEME_KEY);
    return isTheme(t) ? t : 'light';
  } catch { return 'light'; }
}

/** Apply text size: set document attribute + style the radio buttons + persist. */
export function applyTextSize(s: TextSize): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-text-size', s);
  document.querySelectorAll<HTMLElement>('.ts-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.size === s);
  });
  try { localStorage.setItem(SIZE_KEY, s); } catch {}
}

export function readPersistedTextSize(): TextSize {
  if (typeof localStorage === 'undefined') return 'a';
  try {
    const s = localStorage.getItem(SIZE_KEY);
    return isTextSize(s) ? s : 'a';
  } catch { return 'a'; }
}
