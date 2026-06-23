'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyMagicLink } from '@/lib/api/auth';
import { useQueryClient } from '@tanstack/react-query';

function MagicLinkCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('No sign-in token found in URL.');
      return;
    }

    verifyMagicLink(token)
      .then((user) => {
        queryClient.setQueryData(['auth', 'me'], user);
        router.push('/dashboard');
      })
      .catch((err) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? 'Invalid or expired sign-in link.';
        setError(msg);
      });
  }, [searchParams, router, queryClient]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-paper">
        <div
          className="p-6 max-w-sm w-full"
          style={{
            background: 'var(--danger-tint)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--r-md)',
          }}
        >
          <p className="font-semibold mb-1" style={{ color: 'var(--danger)' }}>
            Sign-in failed
          </p>
          <p className="text-sm text-ink-2">{error}</p>
          <a
            href="/login"
            className="mt-4 inline-block text-sm font-semibold"
            style={{ color: 'var(--brand)' }}
          >
            ← Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-paper">
      <p className="text-muted text-sm">Signing you in…</p>
    </div>
  );
}

export default function MagicLinkCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-paper">
          <p className="text-muted text-sm">Signing you in…</p>
        </div>
      }
    >
      <MagicLinkCallback />
    </Suspense>
  );
}
