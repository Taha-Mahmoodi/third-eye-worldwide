'use client';

/*
 * Last-resort fallback if the root layout itself throws.
 * Next.js requires this component to render its own <html> and <body>.
 * Keep it deliberately minimal and dependency-free — no CSS imports,
 * no Nav/Footer, no client bootstrap.
 */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        background: '#f7f3ed',
        color: '#1a0f14',
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
      }}>
        <main role="alert" aria-live="assertive" style={{
          maxWidth: 560,
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '.72rem',
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            color: '#d63384',
            marginBottom: 10,
          }}>
            Critical error
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            lineHeight: 1.1,
            margin: '0 0 16px',
            letterSpacing: '-.02em',
          }}>
            The site couldn&apos;t load.
          </h1>
          <p style={{
            color: 'rgba(26,15,20,.7)',
            lineHeight: 1.6,
            marginBottom: 24,
          }}>
            Something went wrong while preparing the page layout.
            Try reloading — if it keeps failing, reach us at
            {' '}
            <a href="mailto:hello@thirdeyeworldwide.org" style={{ color: '#d63384' }}>
              hello@thirdeyeworldwide.org
            </a>.
          </p>
          {error?.digest ? (
            <p style={{ fontSize: '.85rem', color: 'rgba(26,15,20,.5)' }}>
              Reference: <code>{error.digest}</code>
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 12,
              background: '#d63384',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              padding: '13px 28px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
