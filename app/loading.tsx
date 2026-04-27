/*
 * Route-level loading UI. Next.js automatically wraps every page in
 * a Suspense boundary that uses this component as the fallback while
 * the route renders or while server data is in flight.
 *
 * The skeleton classes are shared with the per-page Suspense boundary
 * fallbacks (see components/Skeleton.tsx and the .skeleton-block
 * styles in globals.css). aria-busy + aria-label tell assistive tech
 * the page is loading rather than empty.
 */
export default function Loading() {
  return (
    <main
      id="main"
      className="page-loading"
      aria-busy="true"
      aria-label="Loading content"
    >
      <div className="skeleton-block" style={{ height: 32 }} />
      <div className="skeleton-block skeleton-block--short" style={{ height: 18 }} />
      <div className="skeleton-block" style={{ height: 240 }} />
    </main>
  );
}
