'use client';

import { useEffect } from 'react';
import { Warning } from '@/components/icons';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/*
 * CMS-2 — dashboard-aware error boundary. A Prisma connection failure
 * on any (dashboard) route renders this instead of the unstyled root
 * error.tsx, keeping the sidebar visible and offering a recovery
 * action.
 *
 * The digest is the React Server Components error fingerprint —
 * displayed only so an editor can quote it when filing a bug.
 */
export default function DashboardError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[CMS dashboard error]', error);
  }, [error]);

  return (
    <div className="adm-error">
      <div className="adm-error-icon" aria-hidden="true">
        <Warning size={40} weight="duotone" />
      </div>
      <h2>Something went wrong</h2>
      <p>
        The page encountered an unexpected error.
        {error.digest ? <> Reference: <code>{error.digest}</code></> : null}
      </p>
      <button type="button" className="btn-primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
