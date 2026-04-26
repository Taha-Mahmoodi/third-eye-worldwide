'use client';

import * as React from 'react';
import {
  type Theme,
  type TextSize,
  applyTheme,
  applyTextSize,
  nextTheme,
  readPersistedTheme,
  readPersistedTextSize,
} from '@/lib/client/theme';

/**
 * React-side state for the theme switcher and text-size control.
 *
 * The DOM attribute (`data-theme`, `data-text-size`) is the source of
 * truth — both React and the legacy `window.*` helpers in
 * `ClientBootstrap.tsx` mutate it through `applyTheme()` /
 * `applyTextSize()`. This Provider just keeps a React mirror of that
 * attribute so JSX components can re-render on changes.
 *
 * Per MED-6 in CODEBASE_REVIEW.md.
 */

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  cycleTheme: () => void;
  textSize: TextSize;
  setTextSize: (s: TextSize) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>('light');
  const [textSize, setTextSizeState] = React.useState<TextSize>('a');

  // Hydrate from localStorage on first mount, then apply.
  React.useEffect(() => {
    const t = readPersistedTheme();
    const s = readPersistedTextSize();
    setThemeState(t);
    setTextSizeState(s);
    applyTheme(t);
    applyTextSize(s);
  }, []);

  const setTheme = React.useCallback((t: Theme) => {
    applyTheme(t);
    setThemeState(t);
  }, []);
  const cycleTheme = React.useCallback(() => {
    setThemeState((cur) => {
      const n = nextTheme(cur);
      applyTheme(n);
      return n;
    });
  }, []);
  const setTextSize = React.useCallback((s: TextSize) => {
    applyTextSize(s);
    setTextSizeState(s);
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, cycleTheme, textSize, setTextSize }),
    [theme, setTheme, cycleTheme, textSize, setTextSize],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be called inside <ThemeProvider>');
  }
  return ctx;
}
