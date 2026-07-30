import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { loginWithPassword } from '@/lib/api/auth';
import { landingPathFor } from '@/lib/auth/guard';

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginWithPassword(email, password),
    onSuccess: (user) => {
      queryClient.setQueryData(['auth', 'me'], user);
      router.replace(landingPathFor(user));
    },
  });
}
