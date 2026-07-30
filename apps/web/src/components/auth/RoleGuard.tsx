'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRole, type AppRole } from '@/contexts/RoleContext';

interface RoleGuardProps {
  require: AppRole;
  redirectTo: string;
  children: React.ReactNode;
}

export function RoleGuard({ require, redirectTo, children }: RoleGuardProps) {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const { role } = useRole();

  const allowed = role === require;

  useEffect(() => {
    if (!isLoading && isAuthenticated && !allowed) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, allowed, redirectTo, router]);

  if (isLoading) {
    return null;
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
