<?php

use App\Modules\Assessment\Controllers\AttemptController;
use App\Modules\Assessment\Controllers\GradingController;
use App\Modules\Assessment\Controllers\QuizController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('courses/{courseId}/quizzes', [QuizController::class, 'index']);
    Route::get('quizzes/{id}', [QuizController::class, 'show']);
    Route::post('quizzes/{id}/start', [AttemptController::class, 'start']);

    Route::get('attempts/{id}', [AttemptController::class, 'show']);
    Route::patch('attempts/{id}/answers', [AttemptController::class, 'saveAnswers']);
    Route::post('attempts/{id}/submit', [AttemptController::class, 'submit']);
    Route::get('attempts/{id}/results', [AttemptController::class, 'results']);

    Route::middleware('role:teacher')->group(function () {
        Route::get('teacher/quizzes', [QuizController::class, 'teacherIndex']);
        Route::post('courses/{courseId}/quizzes', [QuizController::class, 'store']);
        Route::patch('quizzes/{id}', [QuizController::class, 'update']);
        Route::delete('quizzes/{id}', [QuizController::class, 'destroy']);

        Route::prefix('teacher')->group(function () {
            Route::get('grading', [GradingController::class, 'index']);
            Route::patch('grading/{attemptId}/answers/{answerId}', [GradingController::class, 'gradeAnswer']);
            Route::post('grading/{attemptId}/complete', [GradingController::class, 'complete']);
        });
    });
});
