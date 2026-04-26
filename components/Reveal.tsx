'use client';

import * as React from 'react';
import { useRevealOnLoad } from '@/hooks/use-reveal-on-load';

/*
 * Tasteful, taste-restraining reveal wrapper. Direct children fade up
 * (8–14 px) with a soft stagger when the page mounts. Skips entirely
 * for users who prefer reduced motion. The wrapper itself does not
 * affect layout — it renders as a span/div with display: contents
 * by default, so it never introduces a stacking context or block flow.
 */

type Props = {
  children: React.ReactNode;
  /** Delay (s) before the cascade starts. */
  delay?: number;
  /** Stagger (s) between successive children. */
  stagger?: number;
  /** Vertical displacement before reveal, in pixels. */
  y?: number;
  /** Animation duration (s). */
  duration?: number;
  /** Wrapper element. Defaults to `div`. */
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
};

export default function Reveal({
  children,
  delay = 0.05,
  stagger = 0.08,
  y = 14,
  duration = 0.7,
  as = 'div',
  className,
}: Props) {
  const ref = useRevealOnLoad<HTMLDivElement>({ delay, stagger, y, duration, children: true });
  const Tag = as as React.ElementType;
  return (
    <Tag ref={ref as unknown as React.Ref<HTMLDivElement>} className={className}>
      {children}
    </Tag>
  );
}
