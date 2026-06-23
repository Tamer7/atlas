<?php

namespace App\Modules\Assessment\Repositories\Contracts;

use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\User;
use Illuminate\Support\Collection;

interface AnswerRepositoryInterface
{
    public function find(string $id): ?QuizAnswer;

    public function findForAttempt(QuizAttempt $attempt, string $answerId): ?QuizAnswer;

    public function forAttempt(QuizAttempt $attempt): Collection;

    public function upsert(QuizAttempt $attempt, QuizQuestion $question, array $answer): QuizAnswer;

    public function grade(QuizAnswer $answer, User $grader, int $score, ?string $feedback = null): QuizAnswer;

    public function updateAutoScore(QuizAnswer $answer, ?int $score): QuizAnswer;
}
