'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLogout } from '@/hooks/auth/useLogout';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const logout = useLogout();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-12">
      <p
        className="text-xs font-semibold uppercase tracking-[0.14em] mb-2"
        style={{ color: 'var(--muted)' }}
      >
        Dashboard
      </p>
      <h1
        className="text-ink font-semibold mb-6"
        style={{ fontSize: 38, letterSpacing: '-0.025em' }}
      >
        Welcome back, {user?.name?.split(' ')[0] ?? 'there'}.
      </h1>
      <div
        className="inline-flex items-center gap-3 p-4 mb-6"
        style={{
          background: 'var(--success-tint)',
          border: '1px solid #B5DBC0',
          borderRadius: 'var(--r-md)',
        }}
      >
        <span style={{ color: 'var(--success)' }}>✓</span>
        <span className="text-sm text-ink-2">
          API connection confirmed — logged in as <strong>{user?.email}</strong>
        </span>
      </div>
      <br />
      <button
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="text-sm font-semibold"
        style={{ color: 'var(--danger)', background: 'none', border: 0, cursor: 'pointer', padding: 0 }}
      >
        {logout.isPending ? 'Signing out…' : 'Sign out →'}
      </button>
    </div>
  );
}
