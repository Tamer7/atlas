import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decide, isPublicPath, type GuardUser } from '@/lib/auth/guard';

// Server-only, so it is read at runtime. NEXT_PUBLIC_* is inlined at build
// time and cannot be changed without rebuilding the web image.
const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:8000';

async function fetchUser(request: NextRequest): Promise<GuardUser | null> {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { cookie, accept: 'application/json' },
      cache: 'no-store',
      // Fail closed: bounded timeout prevents hung backends from leaving requests
      // pending indefinitely. AbortError is caught below, treated as unauthenticated.
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;

    const body = await res.json();
    const user = body?.data?.user;
    return user && Array.isArray(user.roles) ? { roles: user.roles } : null;
  } catch {
    // Fail closed. An API outage, timeout, or any error must never expose the app shell.
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip the API round-trip entirely for public pages.
  if (isPublicPath(pathname)) return NextResponse.next();

  const decision = decide(pathname, await fetchUser(request));

  if (decision.type === 'redirect') {
    return NextResponse.redirect(new URL(decision.to, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|sanctum).*)'],
};
