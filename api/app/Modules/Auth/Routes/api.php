<?php

use App\Modules\Auth\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// Unauthenticated credential endpoints. The tight limit is deliberate: these
// are the endpoints an attacker guesses against, and TrustProxies makes it
// per-client rather than shared across everyone.
Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('magic-link', [AuthController::class, 'sendMagicLink']);
    Route::get('magic-link/verify', [AuthController::class, 'verifyMagicLink']);
});

// Authenticated session endpoints. These MUST NOT share the credential-guessing
// limit above: the frontend route guard calls /auth/me on every navigation and
// every RSC prefetch, so a 10/min cap logs a normal user out after ~10 clicks.
// They are already protected by auth:sanctum; the limit here only exists to
// bound abuse of a valid session.
Route::prefix('auth')->middleware(['auth:sanctum', 'throttle:240,1'])->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
});
