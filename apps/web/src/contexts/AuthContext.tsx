'use client';

import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/lib/api/auth';
import type { User } from '@/types/user';

interface AuthContextValue {
  user: User | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: undefined,
  isLoading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    retry: false,
    // Identity is the one thing that must not go stale. It was cached for five
    // minutes with no revalidation, so a tab kept rendering the previous user's
    // role after the session was replaced elsewhere (another tab signing in, an
    // invitation being accepted). Re-check on focus and on reconnect so a tab
    // corrects itself the moment you return to it.
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return (
    <AuthContext.Provider
      value={{
        user: isLoading ? undefined : (user ?? null),
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
