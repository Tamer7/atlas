import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/api/auth';
import { resetCsrf } from '@/lib/api/client';

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      resetCsrf();
      queryClient.clear();
      router.push('/login');
    },
  });
}
