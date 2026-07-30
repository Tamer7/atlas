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

  // Sanctum's EnsureFrontendRequestsAreStateful middleware decides whether a
  // request is "stateful" (i.e. cookie/session auth applies at all) purely
  // from `Referer ?: Origin` matching SANCTUM_STATEFUL_DOMAINS. Without one
  // of those headers it returns false, so EncryptCookies/StartSession/
  // AuthenticateSession never run and /auth/me 401s even with a perfectly
  // valid session cookie -- which would fail every user closed into a login
  // loop. We must synthesize a Referer from the INBOUND request's public
  // host, not request.nextUrl (that's the internal host behind Caddy and
  // will never match the configured stateful domain). Do not remove this.
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  const referer = host ? `${proto}://${host}/` : undefined;

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: {
        cookie,
        accept: 'application/json',
        ...(referer ? { referer } : {}),
      },
      cache: 'no-store',
      // Fail closed: bounded timeout prevents hung backends from leaving requests
      // pending indefinitely. AbortError is caught below, treated as unauthenticated.
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      // TEMPORARY DIAGNOSTIC — remove once the intermittent-logout cause is found.
      console.warn(
        `[guard] /auth/me -> ${res.status} path=${request.nextUrl.pathname} ` +
          `rsc=${request.headers.get('rsc') ?? '-'} ` +
          `prefetch=${request.headers.get('next-router-prefetch') ?? '-'} ` +
          `referer=${referer ?? 'NONE'} cookieBytes=${cookie.length}`,
      );
      return null;
    }

    const body = await res.json();
    const user = body?.data?.user;

    if (!user || !Array.isArray(user.roles)) {
      // TEMPORARY DIAGNOSTIC — a 200 whose body we could not read as a user.
      console.warn(
        `[guard] /auth/me -> 200 but unusable body path=${request.nextUrl.pathname} ` +
          `keys=${Object.keys(body ?? {}).join(',') || 'none'}`,
      );
      return null;
    }

    return { roles: user.roles };
  } catch (err: unknown) {
    // TEMPORARY DIAGNOSTIC — distinguishes a thrown fetch (timeout, DNS, reset)
    // from an honest non-200 above. Remove with the block above.
    console.warn(
      `[guard] /auth/me threw path=${request.nextUrl.pathname} ` +
        `name=${(err as Error)?.name ?? 'unknown'} msg=${(err as Error)?.message ?? ''}`,
    );
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
