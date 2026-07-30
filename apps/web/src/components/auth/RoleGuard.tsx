'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRole, type AppRole } from '@/contexts/RoleContext';
import { landingPathFor } from '@/lib/auth/guard';

interface RoleGuardProps {
  require: AppRole;
  children: React.ReactNode;
}

export function RoleGuard({ require, children }: RoleGuardProps) {
  const router = useRouter();
  const { isLoading, isAuthenticated, user } = useAuth();
  const { role } = useRole();

  const allowed = role === require;

  // The redirect target is always derived from the user's own role via
  // landingPathFor, never hardcoded here or by the caller -- a hardcoded
  // destination on one guard and not another is exactly how an admin
  // (require !== "admin" everywhere but /admin) ends up bounced between two
  // layouts that each think the other is the right place for them.
  useEffect(() => {
    if (!isLoading && isAuthenticated && !allowed && user) {
      router.replace(landingPathFor(user));
    }
  }, [isLoading, isAuthenticated, allowed, user, router]);

  if (isLoading) {
    return null;
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
