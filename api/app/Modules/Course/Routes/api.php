<?php

use App\Modules\Course\Controllers\CourseController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('courses', [CourseController::class, 'index']);
    Route::get('courses/{id}', [CourseController::class, 'show']);

    Route::middleware('role:teacher')->group(function () {
        Route::post('courses', [CourseController::class, 'store']);
        Route::patch('courses/{id}', [CourseController::class, 'update']);
    });
});
