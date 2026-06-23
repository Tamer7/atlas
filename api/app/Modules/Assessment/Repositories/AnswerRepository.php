<?php

namespace App\Modules\Assessment\Repositories;

use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\User;
use App\Modules\Assessment\Repositories\Contracts\AnswerRepositoryInterface;
use Illuminate\Support\Collection;

class AnswerRepository implements AnswerRepositoryInterface
{
    public function find(string $id): ?QuizAnswer
    {
        return QuizAnswer::with(['question', 'attempt'])->find($id);
    }

    public function findForAttempt(QuizAttempt $attempt, string $answerId): ?QuizAnswer
    {
        return QuizAnswer::with('question')
            ->where('attempt_id', $attempt->id)
            ->find($answerId);
    }

    public function forAttempt(QuizAttempt $attempt): Collection
    {
        return QuizAnswer::with('question')
            ->where('attempt_id', $attempt->id)
            ->get();
    }

    public function upsert(QuizAttempt $attempt, QuizQuestion $question, array $answer): QuizAnswer
    {
        return QuizAnswer::updateOrCreate(
            [
                'attempt_id'  => $attempt->id,
                'question_id' => $question->id,
            ],
            ['answer' => $answer],
        );
    }

    public function grade(QuizAnswer $answer, User $grader, int $score, ?string $feedback = null): QuizAnswer
    {
        $answer->update([
            'manual_score' => $score,
            'feedback'     => $feedback,
            'graded_at'    => now(),
            'graded_by'    => $grader->id,
        ]);

        return $answer->fresh(['question']);
    }

    public function updateAutoScore(QuizAnswer $answer, ?int $score): QuizAnswer
    {
        $answer->update(['auto_score' => $score]);

        return $answer->fresh(['question']);
    }
}
