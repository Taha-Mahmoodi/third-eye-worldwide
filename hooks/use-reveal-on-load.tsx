'use client';

import * as React from 'react';
import { gsap } from 'gsap';

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
 */

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

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

    const targets = opts.children ? Array.from(el.children) : [el];
    if (targets.length === 0) return;

    const tween = gsap.fromTo(
      targets,
      { opacity: 0, y: opts.y ?? 14 },
      {
        opacity: 1,
        y: 0,
        duration: opts.duration ?? 0.7,
        ease: 'power2.out',
        delay: opts.delay ?? 0,
        stagger: opts.stagger ?? 0,
      }
    );

    return () => {
      tween.kill();
      gsap.set(targets, { clearProps: 'opacity,transform' });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
