export const API_ROUTES = {
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    logout: '/api/v1/auth/logout',
    me: '/api/v1/auth/me',
    magicLink: '/api/v1/auth/magic-link',
    magicLinkVerify: '/api/v1/auth/magic-link/verify',
  },
} as const;
