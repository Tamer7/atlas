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
    staleTime: 5 * 60 * 1000,
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
