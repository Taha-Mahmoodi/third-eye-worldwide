'use client';

/**
 * Re-exports of `@phosphor-icons/react` icons used directly in JSX.
 *
 * Why this file exists: Phosphor's React components rely on
 * `React.createContext` for weight/colour inheritance, which makes
 * them client-only. A server component (anything with generateMetadata,
 * async DB fetches, etc.) can't import directly from
 * `@phosphor-icons/react` — Next will fail at build time with
 * "(0 , n.createContext) is not a function".
 *
 * Server components import named icons from THIS file instead. The
 * `'use client'` directive turns the named re-exports into client
 * islands automatically; the surrounding page stays server-side.
 *
 * For CMS-driven dynamic icon names (where we look up by string),
 * use `components/CmsIcon.tsx`. This file is for static JSX use.
 *
 * Per MED-5 in DEFERRED_PLAN.md.
 */

export {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CaretDown,
  CircleHalf,
  Clock,
  GithubLogo,
  HandHeart,
  Heart,
  LinkedinLogo,
  List,
  Microphone,
  MicrophoneSlash,
  Moon,
  Pause,
  Play,
  Plus,
  SpeakerHigh,
  Star,
  Sun,
  X,
  XLogo,
  YoutubeLogo,
} from '@phosphor-icons/react';
