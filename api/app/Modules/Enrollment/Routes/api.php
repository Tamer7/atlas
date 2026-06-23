<?php

use App\Modules\Enrollment\Controllers\InvitationController;
use App\Modules\Enrollment\Controllers\TeacherStudentController;
use Illuminate\Support\Facades\Route;

// Teacher-only: roster + enrollments
Route::middleware(['auth:sanctum', 'role:teacher'])
    ->prefix('teacher')
    ->group(function () {
        Route::get('students', [TeacherStudentController::class, 'index']);
        Route::post('students/invite', [InvitationController::class, 'store']);
        Route::get('courses/{courseId}/students', [TeacherStudentController::class, 'courseStudents']);
        Route::post('courses/{courseId}/students', [TeacherStudentController::class, 'store']);
        Route::delete('courses/{courseId}/students/{userId}', [TeacherStudentController::class, 'destroy']);
    });

// Public: accept invitation via token
Route::prefix('invitations')
    ->group(function () {
        Route::get('accept', [InvitationController::class, 'accept']);
    });
