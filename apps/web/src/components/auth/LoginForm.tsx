'use client';

import { useState } from 'react';
import Link from 'next/link';
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
    <div className="flex items-center justify-center p-12 bg-paper min-h-screen">
      <div className="w-full max-w-[420px]">
        {/* Brand mark */}
        <div className="flex items-center gap-2.5 mb-10">
          <div
            className="w-7 h-7 flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'var(--ink)', borderRadius: 'var(--r-sm)' }}
          >
            A
          </div>
          <span className="font-semibold text-ink text-lg tracking-tight">Atlas</span>
        </div>

        <h1
          className="text-ink font-semibold mb-2"
          style={{ fontSize: 38, letterSpacing: '-0.025em' }}
        >
          Welcome back.
        </h1>
        <p className="text-muted mb-7 leading-relaxed" style={{ fontSize: 15, maxWidth: 360 }}>
          Sign in to continue your learning. Choose{' '}
          <strong className="text-ink">magic link</strong> for a passwordless flow,
          or use your password.
        </p>

        {/* Mode toggle */}
        <div
          className="grid grid-cols-2 gap-1.5 p-1 mb-6"
          style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-md)' }}
        >
          {(['link', 'password'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="py-2.5 px-3 text-[13px] font-semibold transition-all duration-150"
              style={{
                background: mode === m ? 'var(--card)' : 'transparent',
                boxShadow: mode === m ? 'var(--sh-sm)' : 'none',
                color: mode === m ? 'var(--ink)' : 'var(--muted)',
                borderRadius: 'var(--r-sm)',
                border: 0,
                cursor: 'pointer',
              }}
            >
              {m === 'link' ? '✦ Magic link' : '🔒 Password'}
            </button>
          ))}
        </div>

        {/* Content */}
        {linkSent ? (
          <div
            className="p-5 mb-4"
            style={{
              background: 'var(--success-tint)',
              border: '1px solid #B5DBC0',
              borderRadius: 'var(--r-md)',
            }}
          >
            <p className="font-semibold mb-1" style={{ color: 'var(--success)' }}>
              Check your inbox
            </p>
            <p className="text-sm text-ink-2">
              We sent a sign-in link to <strong>{email}</strong>. It expires in 15 minutes.
            </p>
            <button
              type="button"
              className="mt-3 text-sm font-semibold"
              style={{ color: 'var(--brand)', background: 'none', border: 0, cursor: 'pointer', padding: 0 }}
              onClick={() => setLinkSent(false)}
            >
              Use a different email →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="w-full h-11 px-3.5 text-sm text-ink placeholder:text-faint transition-colors"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--line-2)',
                  borderRadius: 'var(--r-md)',
                  outline: 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--brand)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line-2)')}
              />
              {mode === 'link' && (
                <p className="mt-1 text-xs text-muted">We'll email you a sign-in link</p>
              )}
            </div>

            {mode === 'password' && (
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-11 px-3.5 pr-10 text-sm text-ink placeholder:text-faint transition-colors"
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--line-2)',
                      borderRadius: 'var(--r-md)',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--brand)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line-2)')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink-2 text-base"
                    style={{ background: 'none', border: 0, cursor: 'pointer' }}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
                <div className="text-right mt-1.5">
                  <a href="#" className="text-xs font-semibold" style={{ color: 'var(--brand)' }}>
                    Forgot password?
                  </a>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm" style={{ color: 'var(--danger)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 flex items-center justify-center gap-2 font-semibold text-sm text-white transition-all active:translate-y-px disabled:opacity-60"
              style={{
                background: 'var(--ink)',
                borderRadius: 'var(--r-md)',
                border: 0,
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => !isPending && (e.currentTarget.style.background = 'var(--ink-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--ink)')}
            >
              {isPending ? (
                <Spinner size={16} />
              ) : mode === 'link' ? (
                'Send sign-in link'
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        )}

        {/* OR divider */}
        <div
          className="flex items-center gap-2.5 my-7 text-[11px] font-semibold tracking-[0.12em]"
          style={{ color: 'var(--faint)' }}
        >
          <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
          OR
          <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
        </div>

        {/* Google */}
        <button
          type="button"
          className="w-full h-11 flex items-center justify-center gap-2.5 text-sm font-medium text-ink transition-colors"
          style={{
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--r-md)',
            background: 'var(--card)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--paper-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--card)')}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="mt-7 text-center text-xs" style={{ color: 'var(--muted)' }}>
          New here?{' '}
          <Link href="/register" className="font-semibold text-ink">
            Create an account
          </Link>
        </p>
      </div>
    </div>
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
