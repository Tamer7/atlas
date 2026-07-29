<?php

use App\Modules\Profile\Controllers\StudentCommentController;
use App\Modules\Profile\Controllers\StudentProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('student')->group(function () {
        Route::get('grades', [StudentProfileController::class, 'grades']);
        Route::get('due-assignments', [StudentProfileController::class, 'dueAssignments']);
        Route::get('comments', [StudentProfileController::class, 'comments']);
    });

    Route::middleware('role:teacher')->prefix('teacher')->group(function () {
        Route::get('students/{studentId}/comments', [StudentCommentController::class, 'index']);
        Route::post('students/{studentId}/comments', [StudentCommentController::class, 'store']);
        Route::patch('comments/{id}', [StudentCommentController::class, 'update']);
        Route::delete('comments/{id}', [StudentCommentController::class, 'destroy']);
    });
});
