import axios from 'axios';

/**
 * In the browser we call same-origin `/api/...` (proxied to Laravel via next.config rewrites)
 * so session cookies stay on localhost:3000. SSR uses the direct API URL.
 */
const BASE_URL =
  typeof window !== 'undefined'
    ? ''
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

let csrfInitialised = false;

export const ensureCsrf = async () => {
  if (!csrfInitialised) {
    await apiClient.get('/sanctum/csrf-cookie');
    csrfInitialised = true;
  }
};

apiClient.interceptors.request.use(async (config) => {
  const mutating = ['post', 'put', 'patch', 'delete'].includes(
    (config.method || '').toLowerCase()
  );
  if (mutating) {
    await ensureCsrf();
  }
  return config;
});

// Reset on logout so next login refetches CSRF
export const resetCsrf = () => {
  csrfInitialised = false;
};

const PUBLIC_PATHS = ['/login', '/magic', '/invitation'];

/**
 * Self-correct when the session changes underneath the app.
 *
 * The client caches the current user in TanStack Query. If the server-side
 * session is replaced (another tab logs in as someone else, an invitation is
 * accepted, the session expires) nothing told this tab, so it kept rendering
 * the previous user's role and firing requests that came back 401/403 — the
 * UI said "administrator" while the API said "you are a teacher".
 *
 * On a 401 we do a FULL page load rather than a client-side route change.
 * router.push would preserve the QueryClient and the React tree, i.e. exactly
 * the stale identity we are trying to discard. A hard navigation throws all of
 * it away and the app re-reads who you are from scratch.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const status = (error as { response?: { status?: number } })?.response?.status;

    if (status === 401 && typeof window !== 'undefined') {
      const onPublicPage = PUBLIC_PATHS.some((p) =>
        window.location.pathname.startsWith(p)
      );

      // Never bounce from the login page itself — the 401 there is just a
      // failed sign-in attempt, and redirecting would wipe the error message.
      if (!onPublicPage) {
        resetCsrf();
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  }
);
