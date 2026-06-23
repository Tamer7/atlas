import { useMutation } from '@tanstack/react-query';
import { sendMagicLink } from '@/lib/api/auth';

export function useSendMagicLink() {
  return useMutation({
    mutationFn: (email: string) => sendMagicLink(email),
  });
}
