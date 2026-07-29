<?php

namespace App\Modules\Profile\Repositories\Contracts;

use App\Models\User;
use Illuminate\Support\Collection;

interface StudentRecordRepositoryInterface
{
    public function findStudent(string $id): ?User;

    /** Graded / submitted quiz attempts for the student, newest first. */
    public function gradedAttemptsForStudent(User $student): Collection;

    /** Published quizzes with a due date in the student's enrolled courses. */
    public function dueQuizzesForStudent(User $student): Collection;

    /** Map of quiz_id => latest attempt status for the student. */
    public function latestAttemptStatusByQuiz(User $student, array $quizIds): Collection;
}
