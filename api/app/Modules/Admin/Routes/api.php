<?php

use App\Modules\Admin\Controllers\AdminUserController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')
    ->middleware(['auth:sanctum', 'role:admin'])
    ->group(function () {
        Route::get('users', [AdminUserController::class, 'index']);
        Route::post('users', [AdminUserController::class, 'store']);
        Route::get('users/{id}', [AdminUserController::class, 'show']);
        Route::patch('users/{id}', [AdminUserController::class, 'update']);
        Route::post('users/{id}/deactivate', [AdminUserController::class, 'deactivate']);
        Route::post('users/{id}/reactivate', [AdminUserController::class, 'reactivate']);
        Route::post('users/{id}/password-reset', [AdminUserController::class, 'passwordReset']);
    });
