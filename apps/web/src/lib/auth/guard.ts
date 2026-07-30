export type GuardUser = { roles: string[] };

export type GuardDecision =
  | { type: 'allow' }
  | { type: 'redirect'; to: string };

// No '/register': self-registration is disabled. Accounts are created by an
// administrator or through an invitation link.
const PUBLIC_PATHS = ['/login', '/magic', '/invitation'];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export function landingPathFor(user: GuardUser): string {
  if (user.roles.includes('admin')) return '/admin/users';
  if (user.roles.includes('teacher')) return '/teacher';
  return '/dashboard';
}

export function decide(pathname: string, user: GuardUser | null): GuardDecision {
  if (isPublicPath(pathname)) return { type: 'allow' };
  if (!user) return { type: 'redirect', to: '/login' };

  if (pathname.startsWith('/admin') && !user.roles.includes('admin')) {
    return { type: 'redirect', to: landingPathFor(user) };
  }

  return { type: 'allow' };
}
