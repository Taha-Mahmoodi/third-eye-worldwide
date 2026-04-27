/*
 * Skeleton placeholders for Suspense fallbacks while CMS-driven page
 * content streams in. The animation key is `pulse` (see globals.css).
 *
 * `SkeletonBlock` is the bread-and-butter card; pass `h` for the height
 * in pixels. `SkeletonHero` is the taller variant used at the top of a
 * page so the user sees a believable shape during the first paint.
 */

export interface SkeletonBlockProps {
  h?: number;
}

export function SkeletonBlock({ h = 200 }: SkeletonBlockProps) {
  return (
    <div
      className="skeleton-block"
      style={{ height: h }}
      aria-hidden="true"
    />
  );
}

export function SkeletonHero() {
  return (
    <div className="skeleton-hero" aria-hidden="true">
      <SkeletonBlock h={520} />
    </div>
  );
}
