<?php

use App\Modules\Enrollment\Controllers\InvitationController;
use Illuminate\Support\Facades\Route;

// Teacher-only: send invitation
Route::middleware(['auth:sanctum', 'role:teacher'])
    ->prefix('teacher/students')
    ->group(function () {
        Route::post('invite', [InvitationController::class, 'store']);
    });

// Public: accept invitation via token
Route::prefix('invitations')
    ->group(function () {
        Route::get('accept', [InvitationController::class, 'accept']);
    });
