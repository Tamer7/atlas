<?php

use App\Modules\Analytics\Controllers\DashboardController;
use App\Modules\Analytics\Controllers\ReportsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:teacher'])
    ->prefix('teacher')
    ->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index']);
        Route::get('reports', [ReportsController::class, 'index']);
    });
