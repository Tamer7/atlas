import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logoutUser } from '@/lib/api/auth';
import { resetCsrf } from '@/lib/api/client';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    // onSettled, not onSuccess. If the logout request failed — a 429 from the
    // rate limiter, or a 401 because the session had already gone — the old
    // cleanup never ran, so the app kept the previous user cached and still
    // looked signed in. Signing out must succeed locally regardless of what
    // the server replied.
    onSettled: () => {
      resetCsrf();
      queryClient.clear();
      // Full page load, not router.push: a client-side navigation keeps the
      // QueryClient and React tree alive, which is precisely the state we are
      // trying to discard.
      window.location.replace('/login');
    },
  });
}
