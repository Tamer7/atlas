<?php

use App\Modules\Admin\Controllers\AdminUserController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')
    ->middleware(['auth:sanctum', 'role:admin'])
    ->group(function () {
        Route::get('users', [AdminUserController::class, 'index']);
    });
