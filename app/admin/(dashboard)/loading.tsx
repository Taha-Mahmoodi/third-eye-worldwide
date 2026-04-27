/*
 * CMS-3 — route-level loading UI for every (dashboard) child route.
 * Next.js wraps each child in a Suspense boundary that uses this as
 * the fallback while the server page renders. The shimmer keeps the
 * layout visible during a slow cold-start SQLite read.
 */
export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard" style={{ paddingTop: 8 }}>
      <div
        className="adm-skeleton"
        style={{ height: 32, width: 200, borderRadius: 'var(--radius-md)', marginBottom: 28 }}
      />
      <div className="adm-stats" style={{ marginBottom: 32 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="adm-stat-card adm-skeleton"
            style={{ height: 90 }}
          />
        ))}
      </div>
      <div
        className="adm-skeleton"
        style={{ height: 260, borderRadius: 'var(--radius-lg)' }}
      />
    </div>
  );
}
