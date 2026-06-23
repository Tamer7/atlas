<?php

namespace App\Modules\Assessment\Repositories;

use App\Models\Course;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Modules\Assessment\Repositories\Contracts\AttemptRepositoryInterface;
use Illuminate\Support\Collection;

class AttemptRepository implements AttemptRepositoryInterface
{
    public function find(string $id): ?QuizAttempt
    {
        return QuizAttempt::with(['quiz.questions', 'quiz.course', 'answers.question', 'user'])->find($id);
    }

    public function countForUser(Quiz $quiz, User $user): int
    {
        return QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $user->id)
            ->count();
    }

    public function countCompletedForUser(Quiz $quiz, User $user): int
    {
        return QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $user->id)
            ->whereIn('status', ['submitted', 'graded'])
            ->count();
    }

    public function findInProgress(Quiz $quiz, User $user): ?QuizAttempt
    {
        return QuizAttempt::with(['quiz.questions', 'quiz.course', 'answers.question', 'user'])
            ->where('quiz_id', $quiz->id)
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->first();
    }

    public function create(Quiz $quiz, User $user): QuizAttempt
    {
        return QuizAttempt::create([
            'quiz_id'    => $quiz->id,
            'user_id'    => $user->id,
            'status'     => 'in_progress',
            'started_at' => now(),
        ]);
    }

    public function update(QuizAttempt $attempt, array $data): QuizAttempt
    {
        $attempt->update($data);

        return $attempt->fresh(['quiz.questions', 'answers.question', 'user']);
    }

    public function gradingQueueForTeacher(User $teacher): Collection
    {
        $courseIds = Course::where('instructor_id', $teacher->id)->pluck('id');

        return QuizAttempt::with(['quiz.course', 'user', 'answers.question'])
            ->where('status', 'submitted')
            ->whereHas('quiz', fn ($q) => $q->whereIn('course_id', $courseIds))
            ->whereHas('answers', function ($q) {
                $q->whereNull('manual_score')
                    ->whereHas('question', fn ($qq) => $qq->whereIn('type', ['short', 'essay', 'code', 'upload']));
            })
            ->orderByDesc('submitted_at')
            ->get();
    }
}
