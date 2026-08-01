'use client';

import { useState } from 'react';
import { useLogin } from '@/hooks/auth/useLogin';
import { useSendMagicLink } from '@/hooks/auth/useMagicLink';
import { Spinner } from '@/components/ui/Spinner';

type Mode = 'link' | 'password';

export function LoginForm() {
  const [mode, setMode] = useState<Mode>('link');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const login = useLogin();
  const sendMagicLink = useSendMagicLink();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'link') {
      sendMagicLink.mutate(email, { onSuccess: () => setLinkSent(true) });
    } else {
      login.mutate({ email, password });
    }
  };

  const isPending = login.isPending || sendMagicLink.isPending;
  const error =
    (login.error as { response?: { data?: { message?: string } } })?.response
      ?.data?.message || (sendMagicLink.error as Error)?.message;

  return (
    <div className="login-card">
      <div className="login-brand">
        <div className="logo">A</div>
        <div className="name">Atlas</div>
      </div>

      <h1 className="login-heading">Sign in</h1>

      <div
        className="role-switch"
        style={{ marginBottom: 18, background: 'var(--paper-2)', borderColor: 'transparent' }}
      >
        {(['link', 'password'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={mode === m ? 'active' : ''}
          >
            {m === 'link' ? 'Magic link' : 'Password'}
          </button>
        ))}
      </div>

      {linkSent ? (
        <div
          className="card-pad"
          style={{
            background: 'var(--success-tint)',
            border: '1px solid #B5DBC0',
            borderRadius: 'var(--r-md)',
          }}
        >
          <p style={{ fontWeight: 600, color: 'var(--success)', margin: '0 0 4px' }}>
            Check your inbox
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>
            We sent a sign-in link to <strong>{email}</strong>. It expires in 15 minutes.
          </p>
          <button
            type="button"
            onClick={() => setLinkSent(false)}
            style={{
              marginTop: 12,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--brand)',
              background: 'none',
              border: 0,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Use a different email →
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              required
            />
            {mode === 'link' && (
              <p className="help">We&apos;ll email you a sign-in link</p>
            )}
          </div>

          {mode === 'password' && (
            <div style={{ marginBottom: 14 }}>
              <label className="label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  style={{ paddingRight: 44 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: 4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 34,
                    height: 34,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'none',
                    border: 0,
                    cursor: 'pointer',
                    color: 'var(--muted)',
                  }}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <a href="#" style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand)' }}>
                  Forgot password?
                </a>
              </div>
            </div>
          )}

          {error && (
            <p style={{ fontSize: 13, color: 'var(--danger)', margin: '0 0 12px' }} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary btn-lg btn-block"
            style={{ opacity: isPending ? 0.65 : 1 }}
          >
            {isPending && <Spinner size={16} />}
            {mode === 'link' ? 'Send sign-in link' : 'Sign in'}
          </button>
        </form>
      )}

      <div className="login-divider">OR</div>

      <button type="button" className="btn btn-secondary btn-lg btn-block">
        <GoogleIcon />
        Continue with Google
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.7 5.1A9.9 9.9 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3 4M6.1 6.1A17.4 17.4 0 0 0 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.1-1.4" />
      <path d="m2 2 20 20" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.6z" />
      <path fill="#34A853" d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7C4.4 19.7 7.9 22 12 22z" />
      <path fill="#FBBC05" d="M6.2 13.6a6 6 0 0 1 0-3.8V7.1H2.7a10 10 0 0 0 0 9z" />
      <path fill="#EA4335" d="M12 5.8c1.5 0 2.9.5 4 1.5l3-3A10 10 0 0 0 2.7 7.1l3.5 2.7c.8-2.5 3.1-4 5.8-4z" />
    </svg>
  );
}
