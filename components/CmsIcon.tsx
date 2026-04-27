'use client';

import * as React from 'react';
import {
  Briefcase,
  Camera,
  ChalkboardTeacher,
  Code,
  CurrencyCircleDollar,
  DeviceMobile,
  EyeSlash,
  Gear,
  GlobeHemisphereEast,
  GraduationCap,
  HandHeart,
  HouseLine,
  MagnifyingGlass,
  MapPin,
  Microphone,
  PencilLine,
  Scales,
  SpeakerHigh,
  Star,
  Translate,
  UsersThree,
  type Icon,
} from '@phosphor-icons/react';

/**
 * CMS-driven icon renderer. Resolves a kebab-case Phosphor name
 * (e.g. `ph-house-line`, also accepts `house-line` or `HouseLine`) to
 * a real React component from `@phosphor-icons/react`.
 *
 * The set is an explicit allowlist — every icon the CMS may reference
 * has to be imported here so webpack tree-shakes individual SVGs.
 * `import * as Icons` would pull every Phosphor icon (~600 KB) into
 * the bundle. Adding a new icon: add the import + a MAP entry, ship.
 *
 * Per MED-5 PR 1 in DEFERRED_PLAN.md.
 */

// ── Source of truth: the 20 icons currently referenced by data/seed.json.
//    Keys accept the `ph-` prefix or the bare slug; the plain PascalCase
//    name is also recognised so JSX can pass `name="HouseLine"`.
const ICON_MAP: Record<string, Icon> = {
  'briefcase': Briefcase,
  'camera': Camera,
  'chalkboard-teacher': ChalkboardTeacher,
  'code': Code,
  'currency-circle-dollar': CurrencyCircleDollar,
  'device-mobile': DeviceMobile,
  'eye-slash': EyeSlash,
  'gear': Gear,
  'globe-hemisphere-east': GlobeHemisphereEast,
  'graduation-cap': GraduationCap,
  'hand-heart': HandHeart,
  'house-line': HouseLine,
  'magnifying-glass': MagnifyingGlass,
  'map-pin': MapPin,
  'microphone': Microphone,
  'pencil-line': PencilLine,
  'scales': Scales,
  'speaker-high': SpeakerHigh,
  // `star` is the legacy fallback used by ProjectCard / ProjectDetail
  // when an item has no icon set in the CMS — preserved here for parity.
  'star': Star,
  'translate': Translate,
  'users-three': UsersThree,
};

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

interface CmsIconProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'name'> {
  /** Phosphor icon slug. Accepts e.g. "ph-house-line", "house-line", "HouseLine". */
  name: string | null | undefined;
  weight?: IconWeight;
  size?: number | string;
}

const warned = new Set<string>();
function warnUnknown(raw: string) {
  if (process.env.NODE_ENV === 'production' || warned.has(raw)) return;
  warned.add(raw);
  // eslint-disable-next-line no-console
  console.warn(
    `[CmsIcon] unknown icon name: ${JSON.stringify(raw)}. ` +
    `Add it to ICON_MAP in components/CmsIcon.tsx.`,
  );
}

function normalise(raw: string): string {
  // Strip `ph-` / `ph ` prefix the CDN-era CMS used.
  const stripped = raw.replace(/^ph[ -]/, '').trim();
  // Convert PascalCase / camelCase to kebab — e.g. "HouseLine" → "house-line".
  return stripped
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/^-/, '')
    .toLowerCase();
}

export default function CmsIcon({
  name,
  weight = 'regular',
  size = '1em',
  ...rest
}: CmsIconProps) {
  if (!name || typeof name !== 'string') return null;
  const key = normalise(name);
  const Comp = ICON_MAP[key];
  if (!Comp) {
    warnUnknown(name);
    return null;
  }
  return <Comp weight={weight} size={size} {...rest} />;
}
