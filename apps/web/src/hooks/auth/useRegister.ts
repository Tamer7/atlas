import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api/auth';

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => registerUser(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(['auth', 'me'], user);
      router.push('/dashboard');
    },
  });
}
