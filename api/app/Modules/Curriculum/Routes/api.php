<?php

use App\Modules\Curriculum\Controllers\DiscussionController;
use App\Modules\Curriculum\Controllers\LessonController;
use App\Modules\Curriculum\Controllers\ModuleController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('courses/{courseId}/modules', [ModuleController::class, 'index']);
    Route::post('courses/{courseId}/modules', [ModuleController::class, 'store'])
        ->middleware('role:teacher');

    Route::middleware('role:teacher')->group(function () {
        Route::patch('modules/{id}', [ModuleController::class, 'update']);
        Route::delete('modules/{id}', [ModuleController::class, 'destroy']);
        Route::post('modules/{moduleId}/lessons', [LessonController::class, 'store']);
        Route::patch('lessons/{id}', [LessonController::class, 'update']);
        Route::delete('lessons/{id}', [LessonController::class, 'destroy']);
    });

    Route::get('lessons/{id}', [LessonController::class, 'show']);

    Route::post('lessons/{id}/progress', [LessonController::class, 'updateProgress']);
    Route::patch('lessons/{id}/notes', [LessonController::class, 'updateNotes']);

    Route::get('lessons/{id}/discussion', [DiscussionController::class, 'index']);
    Route::post('lessons/{id}/discussion', [DiscussionController::class, 'store']);
});
