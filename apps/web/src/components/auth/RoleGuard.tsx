'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';

interface RoleGuardProps {
  require: 'teacher' | 'student';
  redirectTo: string;
  children: React.ReactNode;
}

export function RoleGuard({ require, redirectTo, children }: RoleGuardProps) {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const { isTeacher } = useRole();

  const allowed = require === 'teacher' ? isTeacher : !isTeacher;

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
