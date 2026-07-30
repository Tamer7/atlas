'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { acceptInvitation } from '@/lib/api/enrollment';
import { landingPathFor } from '@/lib/auth/guard';

function InvitationAcceptCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = searchParams.get('token');
  // Computed at render time rather than set from inside the effect below:
  // setting state synchronously at the top of an effect body causes an
  // avoidable extra render (react-hooks/set-state-in-effect); the "no token"
  // case is knowable immediately from the URL, so it doesn't need one.
  const [error, setError] = useState<string | null>(
    token ? null : 'No invitation token found in URL.'
  );

  useEffect(() => {
    if (!token) return;

    acceptInvitation(token)
      .then((user) => {
        queryClient.setQueryData(['auth', 'me'], user);
        router.replace(landingPathFor(user));
      })
      .catch((err) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? 'Invalid or expired invitation.';
        setError(msg);
      });
  }, [token, router, queryClient]);

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
            Invitation failed
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
      <p className="text-muted text-sm">Accepting your invitation…</p>
    </div>
  );
}

export default function InvitationAcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-paper">
          <p className="text-muted text-sm">Accepting your invitation…</p>
        </div>
      }
    >
      <InvitationAcceptCallback />
    </Suspense>
  );
}
