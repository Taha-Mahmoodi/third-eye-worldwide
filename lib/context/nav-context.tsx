'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  closeNav as closeNavDom,
  openNav as openNavDom,
  toggleNav as toggleNavDom,
  isNavOpen,
} from '@/lib/client/nav';

/**
 * React-side mobile nav open/close state.
 *
 * The DOM (`#primary-nav.open`) is still the source of truth — that
 * matches what existing CSS hooks read — but this Provider mirrors
 * the state so JSX can re-render burger glyphs etc. on toggle.
 *
 * The Provider also closes the nav on every route change (the old
 * behavior lived in ClientBootstrap; lifting it here keeps the side
 * effect with the state that owns it).
 *
 * Per MED-6 in CODEBASE_REVIEW.md.
 */

interface NavContextValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
  openNav: () => void;
}

const NavContext = React.createContext<NavContextValue | null>(null);

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState<boolean>(false);
  const pathname = usePathname();

  // Close on route change.
  React.useEffect(() => {
    closeNavDom();
    setOpen(false);
  }, [pathname]);

  // If the legacy `window.toggleNav` mutated the DOM (an inline-
  // onclick handler from a legacy HTML route), keep our React state
  // in sync at the next tick.
  React.useEffect(() => {
    const sync = () => setOpen(isNavOpen());
    const interval = window.setInterval(sync, 500);
    return () => window.clearInterval(interval);
  }, []);

  const toggle = React.useCallback(() => {
    toggleNavDom();
    setOpen(isNavOpen());
  }, []);
  const close = React.useCallback(() => {
    closeNavDom();
    setOpen(false);
  }, []);
  const openNav = React.useCallback(() => {
    openNavDom();
    setOpen(true);
  }, []);

  const value = React.useMemo<NavContextValue>(
    () => ({ open, toggle, close, openNav }),
    [open, toggle, close, openNav],
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavContextValue {
  const ctx = React.useContext(NavContext);
  if (!ctx) {
    throw new Error('useNav must be called inside <NavProvider>');
  }
  return ctx;
}
