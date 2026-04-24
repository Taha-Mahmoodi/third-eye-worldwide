'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Surface the error in dev tools so it can be inspected.
    // In production, hook a real error reporter (Sentry, etc.) here.
    // eslint-disable-next-line no-console
    console.error('App error boundary caught:', error);
  }, [error]);

  return (
    <div className="error-page" role="alert" aria-live="assertive">
      <div className="error-inner">
        <div className="error-code error-code-500" aria-hidden="true">500</div>
        <div className="section-eyebrow">Something went wrong</div>
        <h1 className="error-title">
          We hit an <em>unexpected error.</em>
        </h1>
        <p className="error-sub">
          The page couldn&apos;t be rendered. This has been logged on our end.
          You can try again, or head back to the home page.
        </p>

        {error?.digest ? (
          <p className="error-digest">
            Reference: <code>{error.digest}</code>
          </p>
        ) : null}

        <div className="error-actions">
          <button type="button" className="btn-primary" onClick={() => reset()}>
            <i className="ph ph-arrow-clockwise"></i>
            Try again
          </button>
          <Link href="/" className="btn-secondary">
            <i className="ph ph-house"></i>
            Back to home
          </Link>
        </div>

        <div className="error-links">
          <div className="error-links-title">If this keeps happening</div>
          <ul>
            <li>
              <a href="mailto:hello@thirdeyeworldwide.org">
                Tell us what went wrong — hello@thirdeyeworldwide.org
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
