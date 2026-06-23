<?php

namespace App\Modules\Assessment\Repositories\Contracts;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Support\Collection;

interface AttemptRepositoryInterface
{
    public function find(string $id): ?QuizAttempt;

    public function countForUser(Quiz $quiz, User $user): int;

    public function countCompletedForUser(Quiz $quiz, User $user): int;

    public function findInProgress(Quiz $quiz, User $user): ?QuizAttempt;

    public function create(Quiz $quiz, User $user): QuizAttempt;

    public function update(QuizAttempt $attempt, array $data): QuizAttempt;

    public function gradingQueueForTeacher(User $teacher): Collection;
}
