import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { loginWithPassword } from '@/lib/api/auth';

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginWithPassword(email, password),
    onSuccess: (user) => {
      queryClient.setQueryData(['auth', 'me'], user);
      const isTeacher = user.roles?.includes('teacher') ?? false;
      router.replace(isTeacher ? '/teacher' : '/dashboard');
    },
  });
}
