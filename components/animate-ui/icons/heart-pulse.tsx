'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';

/**
 * A small animated heart for use on Donate CTAs. Visually identical
 * to Phosphor's `ph-fill ph-heart` so it sits cleanly next to the
 * other Phosphor icons on the site, but adds a subtle perpetual
 * pulse — about every 2.4 s, the heart scales up ~10% and back. This
 * draws the eye to the giving CTA without being noisy.
 *
 * Skips the animation entirely under prefers-reduced-motion.
 *
 * Uses motion/react (the Animate UI / Framer Motion stack already
 * present in the project).
 */

type HeartPulseProps = {
  /** Pixel size, applied to both width and height. Default 16 px. */
  size?: number | string;
  className?: string;
  /** Override the perpetual loop period (s). Default 2.4. */
  durationSec?: number;
  /** ARIA label; defaults to decorative (aria-hidden). */
  ariaLabel?: string;
};

export default function HeartPulseIcon({
  size = 16,
  className,
  durationSec = 2.4,
  ariaLabel,
}: HeartPulseProps) {
  const reduced = useReducedMotion();

  return (
    <motion.svg
      role={ariaLabel ? 'img' : undefined}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      className={className}
      animate={reduced ? undefined : { scale: [1, 1.1, 1, 1, 1] }}
      transition={
        reduced
          ? undefined
          : {
              duration: durationSec,
              ease: 'easeInOut',
              repeat: Infinity,
              // Hold scale=1 for most of the cycle so the pulse feels like a
              // heartbeat (brief lift, long rest), not a constant breathing.
              times: [0, 0.08, 0.18, 1, 1],
            }
      }
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
    >
      {/* Phosphor "heart-fill" path, lifted from the Phosphor icons set
          for visual parity with the rest of the site. */}
      <path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32Z" />
    </motion.svg>
  );
}
