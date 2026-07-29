<?php

use App\Modules\Course\Controllers\CourseController;
use App\Modules\Course\Controllers\ScheduleController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('courses', [CourseController::class, 'index']);
    Route::get('courses/{id}', [CourseController::class, 'show']);

    Route::get('courses/{courseId}/schedule', [ScheduleController::class, 'index']);
    Route::get('my/schedule', [ScheduleController::class, 'mySchedule']);

    Route::middleware('role:teacher')->group(function () {
        Route::post('courses', [CourseController::class, 'store']);
        Route::patch('courses/{id}', [CourseController::class, 'update']);

        Route::post('courses/{courseId}/schedule', [ScheduleController::class, 'store']);
        Route::patch('schedule-slots/{id}', [ScheduleController::class, 'update']);
        Route::delete('schedule-slots/{id}', [ScheduleController::class, 'destroy']);
    });
});
