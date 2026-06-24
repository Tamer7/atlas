<?php

use App\Modules\Live\Controllers\LiveClassController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('courses/{courseId}/live-classes', [LiveClassController::class, 'index']);
    Route::post('live-classes/{id}/token', [LiveClassController::class, 'token']);

    Route::middleware('role:teacher')->group(function () {
        Route::get('teacher/live-classes', [LiveClassController::class, 'teacherIndex']);
        Route::post('live-classes', [LiveClassController::class, 'store']);
        Route::post('live-classes/{id}/start', [LiveClassController::class, 'start']);
        Route::post('live-classes/{id}/end', [LiveClassController::class, 'end']);
    });
});
