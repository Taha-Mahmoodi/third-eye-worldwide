'use client';

import * as React from 'react';
import { animate, stagger } from 'motion/react';

/**
 * Soft entrance animation for an element (and optionally its direct
 * children, staggered). Skips entirely when the user prefers reduced
 * motion. Designed to be tasteful — small displacement, short
 * duration, no bounce.
 *
 * We use `useLayoutEffect` so the "from" state (opacity 0, y offset)
 * is committed before the first paint. With plain `useEffect`, React
 * has already painted the visible content once, and the subsequent
 * jump to opacity:0 produces a flash before the fade-in begins.
 *
 * Backed by motion/react (was GSAP before MED-7 — we standardised on
 * motion since it's the React-native animation lib already in use by
 * Animate UI primitives).
 */

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

// Approximation of GSAP's `power2.out` ease as a cubic-bezier — tuned
// to feel identical to the previous behavior.
const POWER2_OUT_BEZIER: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export function useRevealOnLoad<T extends HTMLElement>(opts: {
  stagger?: number;
  delay?: number;
  y?: number;
  duration?: number;
  /** When true, animate direct children of the ref instead of the ref itself. */
  children?: boolean;
} = {}) {
  const ref = React.useRef<T | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const el = ref.current;
    if (!el) return;

    const targets = (
      opts.children ? Array.from(el.children) : [el]
    ).filter((t): t is HTMLElement => t instanceof HTMLElement);
    if (targets.length === 0) return;

    const yFrom = opts.y ?? 14;
    const baseDelay = opts.delay ?? 0;
    const staggerAmount = opts.stagger ?? 0;

    const controls = animate(
      targets,
      { opacity: [0, 1], y: [yFrom, 0] },
      {
        duration: opts.duration ?? 0.7,
        ease: POWER2_OUT_BEZIER,
        delay: staggerAmount ? stagger(staggerAmount, { startDelay: baseDelay }) : baseDelay,
      },
    );

    return () => {
      controls.stop();
      // Clear motion's inline styles so React-driven changes after
      // unmount aren't fighting a stale opacity/transform.
      for (const t of targets) {
        t.style.opacity = '';
        t.style.transform = '';
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
