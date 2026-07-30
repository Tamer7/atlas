<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserActive
{
    public function handle(Request $request, Closure $next): Response
    {
        // Resolve via the sanctum guard explicitly rather than the default
        // guard. This middleware runs on the api group, before route-level
        // auth:sanctum has a chance to call Auth::shouldUse('sanctum'), so
        // $request->user() with no argument would resolve through the
        // default guard (web/session) and see null for a request
        // authenticated only by a bearer token. Sanctum's guard checks the
        // session guard(s) from config('sanctum.guard') first and falls back
        // to bearer token validation, so this covers both auth paths.
        $user = $request->user('sanctum');

        if ($user && ! $user->isActive()) {
            Auth::guard('web')->logout();

            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            return response()->json(['message' => 'Account deactivated.'], 401);
        }

        return $next($request);
    }
}
