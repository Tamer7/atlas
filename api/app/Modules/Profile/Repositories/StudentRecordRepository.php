<?php

namespace App\Modules\Profile\Repositories;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Modules\Profile\Repositories\Contracts\StudentRecordRepositoryInterface;
use Illuminate\Support\Collection;

class StudentRecordRepository implements StudentRecordRepositoryInterface
{
    public function findStudent(string $id): ?User
    {
        return User::find($id);
    }

    public function gradedAttemptsForStudent(User $student): Collection
    {
        return QuizAttempt::with(['quiz:id,title,quiz_type,passing_score,course_id', 'quiz.course:id,title,tag'])
            ->where('user_id', $student->id)
            ->whereIn('status', ['submitted', 'graded'])
            ->orderByDesc('submitted_at')
            ->get();
    }

    public function dueQuizzesForStudent(User $student): Collection
    {
        return Quiz::with('course:id,title,tag')
            ->withCount('questions')
            ->whereNotNull('published_at')
            ->whereNotNull('due_at')
            ->whereHas('course.enrollments', fn ($q) => $q->where('user_id', $student->id))
            ->orderBy('due_at')
            ->get();
    }

    public function latestAttemptStatusByQuiz(User $student, array $quizIds): Collection
    {
        return QuizAttempt::where('user_id', $student->id)
            ->whereIn('quiz_id', $quizIds)
            ->orderByDesc('started_at')
            ->get(['id', 'quiz_id', 'status'])
            ->groupBy('quiz_id')
            ->map(fn ($attempts) => $attempts->first()->status);
    }
}
