'use client';

import { useState } from 'react';

/*
 * Newsletter signup on /documents#blogs. Client-only because it
 * tracks submit state; not wired to a backend (the original was
 * also client-only — it just toggled button text on submit).
 */
export default function NewsletterForm() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    // TODO: wire to /api/cms/submissions/newsletter once it exists.
    setSubscribed(true);
  }

  return (
    <div className="newsletter-card">
      <div>
        <div className="section-eyebrow" style={{ marginBottom: 10 }}>Newsletter</div>
        <h2 className="newsletter-title">Twice a month. No spam.</h2>
        <p className="newsletter-body">
          Research summaries, new tools, and stories from the field — delivered in plain
          text, screen-reader-optimised, with a one-click unsubscribe.
        </p>
      </div>
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="newsletter-input"
          aria-label="Email address"
          disabled={subscribed}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{ justifyContent: 'center' }}
          disabled={subscribed}
        >
          {subscribed ? (
            <><i className="ph ph-check" aria-hidden="true"></i> Subscribed</>
          ) : (
            <><i className="ph ph-paper-plane-tilt" aria-hidden="true"></i> Subscribe</>
          )}
        </button>
      </form>
    </div>
  );
}
