'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';

/**
 * A small per-tab icon that appears next to a top-nav tab when the
 * user hovers (or focuses) the tab. Layout-stable: each tab always
 * reserves the icon's slot, so neighboring tabs never shift sideways
 * when a sibling is hovered. Inside that slot the SVG fades in,
 * slides from a few px to the left, and scales from 0.7 → 1, which
 * reads as "an icon flew in to greet you" rather than "a static
 * icon turned on" — the Animate UI house style.
 *
 * Visual silhouettes are the Phosphor `regular` icon paths so the
 * icons sit cleanly next to the rest of the Phosphor glyphs already
 * used across the nav and footer.
 *
 * Honors prefers-reduced-motion: snaps to the visible/hidden state
 * with no easing.
 *
 * Lives in `components/animate-ui/icons/` alongside `heart-pulse.tsx`.
 */

export type NavTabIconName =
  | 'home'
  | 'about'
  | 'projects'
  | 'media'
  | 'documents'
  | 'volunteer';

// Phosphor `regular` weight paths, viewBox 0 0 256 256. Picked to
// communicate each tab's content without overlapping with the heart
// icon already used on the Donate CTA.
const PATHS: Record<NavTabIconName, string> = {
  // ph-house
  home: 'M218.83,103.77,138.83,30.92a16,16,0,0,0-21.66,0L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l80-72.72,80,72.73Z',
  // ph-users-three
  about:
    'M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z',
  // ph-toolbox
  projects:
    'M216,64H176V56a24,24,0,0,0-24-24H104A24,24,0,0,0,80,56v8H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM96,56a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm120,16v40H40V72ZM40,200V128H80v16a8,8,0,0,0,16,0V128h64v16a8,8,0,0,0,16,0V128h40v72Z',
  // ph-camera
  media:
    'M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.43l13.63,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z',
  // ph-file-text
  documents:
    'M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z',
  // ph-hand-waving — volunteers wave hello
  volunteer:
    'M48.27,150.69a8,8,0,0,1-11.18-1.74,79.82,79.82,0,0,1-15-38.49A8,8,0,1,1,38,108.32,63.79,63.79,0,0,0,50,139.51,8,8,0,0,1,48.27,150.69ZM231.59,75.5a16,16,0,0,0-9.72-7.45l-3.5-.94L213,46.78a16,16,0,0,0-19.6-11.31l-77.26,20.7a16,16,0,0,0-11.31,19.6l.94,3.5L82.52,98.17l-3.5-.94a16,16,0,0,0-19.6,11.31L41.69,175a64.05,64.05,0,0,0,45.27,78.39l30.89,8.28A64,64,0,0,0,196.24,216l40-149.21A16,16,0,0,0,231.59,75.5ZM148.94,77.36l44-11.79,3.1,11.59L152,89,148.94,77.36ZM212,72.85l3.1,11.58-44.05,11.8L168,84.65Zm9,77,1.62,6,8.78,2.36L196.83,90l-9.45-1.16-2.31,4.43Zm-2.05-83.85,11.58-3.1L233.65,75l-11.59,3.11Z',
};

type Props = {
  name: NavTabIconName;
  /** True when the parent tab is hovered or focused. */
  visible?: boolean;
  /** Pixel size of the rendered SVG. Default 14 px (matches the line-
   *  height of the surrounding nav text without dwarfing it). */
  size?: number;
  /** Class for the outer span (color is inherited from the nav link). */
  className?: string;
};

export default function NavTabIcon({
  name,
  visible = false,
  size = 14,
  className,
}: Props) {
  const reduced = useReducedMotion();
  const path = PATHS[name];

  // The slot is always laid out at this width, regardless of `visible`.
  // That keeps the nav layout perfectly stable — hovering one tab
  // never shifts its siblings.
  const slotWidth = size + 6;

  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        verticalAlign: 'middle',
        width: slotWidth,
        height: size,
        // The icon needs a positioning context so the inner motion.svg
        // can translate freely without affecting siblings.
        position: 'relative',
      }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="currentColor"
        initial={false}
        animate={{
          opacity: visible ? 1 : 0,
          x: visible ? 0 : -4,
          scale: visible ? 1 : 0.7,
        }}
        transition={
          reduced
            ? { duration: 0 }
            : {
                type: 'spring',
                stiffness: 480,
                damping: 26,
                mass: 0.4,
              }
        }
        style={{
          flexShrink: 0,
          transformBox: 'fill-box',
          transformOrigin: 'center',
        }}
      >
        <path d={path} />
      </motion.svg>
    </span>
  );
}
