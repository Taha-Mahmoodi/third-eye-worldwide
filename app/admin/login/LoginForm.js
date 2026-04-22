'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginForm({ callbackUrl = '/admin', error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState(error === 'CredentialsSignin' ? 'Invalid email or password.' : error || '');

  async function onSubmit(e) {
    e.preventDefault();
    if (!email || !password) { setMsg('Please enter email and password.'); return; }
    setPending(true);
    setMsg('Signing in…');
    const res = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      password,
      callbackUrl,
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setMsg(res.error === 'CredentialsSignin' ? 'Invalid email or password.' : res.error);
      return;
    }
    window.location.href = res?.url || callbackUrl;
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 160px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <form
        onSubmit={onSubmit}
        style={{
          width: '100%', maxWidth: 420, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '36px 32px', boxShadow: 'var(--shadow-md)',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 8 }}>
            TEWW CMS
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-.02em', color: 'var(--fg)', marginBottom: 4 }}>
            Sign in
          </h1>
          <p style={{ fontSize: '.92rem', color: 'var(--fg-muted)' }}>Access the content dashboard.</p>
        </div>

        <div className="pay-field">
          <label>Email</label>
          <input
            type="email" autoComplete="email" required autoFocus
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="pay-field">
          <label>Password</label>
          <input
            type="password" autoComplete="current-password" required
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit" className="btn-primary"
          disabled={pending}
          style={{ justifyContent: 'center', marginTop: 8 }}
        >
          <i className="ph ph-sign-in"></i> {pending ? 'Signing in…' : 'Sign in'}
        </button>

        {msg ? (
          <div style={{ fontSize: '.88rem', color: msg.startsWith('Signing') ? 'var(--fg-muted)' : 'var(--accent)' }}>
            {msg}
          </div>
        ) : null}
      </form>
    </div>
  );
}
