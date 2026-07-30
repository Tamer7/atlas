import { describe, expect, it } from 'vitest';
import { decide, isPublicPath, landingPathFor } from '@/lib/auth/guard';

describe('isPublicPath', () => {
  it('allows auth pages', () => {
    expect(isPublicPath('/login')).toBe(true);
    expect(isPublicPath('/magic')).toBe(true);
    expect(isPublicPath('/invitation/accept')).toBe(true);
  });

  it('does not treat app pages as public', () => {
    expect(isPublicPath('/courses')).toBe(false);
    expect(isPublicPath('/dashboard')).toBe(false);
    // Self-registration is disabled; /register must never be publicly reachable.
    expect(isPublicPath('/register')).toBe(false);
  });
});

describe('landingPathFor', () => {
  it('routes each role to its own landing page', () => {
    expect(landingPathFor({ roles: ['admin'] })).toBe('/admin/users');
    expect(landingPathFor({ roles: ['teacher'] })).toBe('/teacher');
    expect(landingPathFor({ roles: ['student'] })).toBe('/dashboard');
  });

  it('prefers admin when a user somehow holds several roles', () => {
    expect(landingPathFor({ roles: ['student', 'admin'] })).toBe('/admin/users');
  });
});

describe('decide', () => {
  it('allows public paths without a user', () => {
    expect(decide('/login', null)).toEqual({ type: 'allow' });
  });

  it('redirects an unauthenticated user away from a protected path', () => {
    expect(decide('/courses', null)).toEqual({ type: 'redirect', to: '/login' });
  });

  it('allows an authenticated user through a protected path', () => {
    expect(decide('/courses', { roles: ['student'] })).toEqual({ type: 'allow' });
  });

  it('keeps non-admins out of the admin area', () => {
    expect(decide('/admin/users', { roles: ['teacher'] }))
      .toEqual({ type: 'redirect', to: '/teacher' });
    expect(decide('/admin/users', { roles: ['student'] }))
      .toEqual({ type: 'redirect', to: '/dashboard' });
  });

  it('lets an admin into the admin area', () => {
    expect(decide('/admin/users', { roles: ['admin'] })).toEqual({ type: 'allow' });
  });

  it('redirects an unauthenticated user away from the admin area', () => {
    expect(decide('/admin/users', null)).toEqual({ type: 'redirect', to: '/login' });
  });
});
