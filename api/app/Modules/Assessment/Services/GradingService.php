<?php

namespace App\Modules\Assessment\Services;

use App\Models\QuizAttempt;
use App\Models\User;
use App\Modules\Assessment\Repositories\Contracts\AnswerRepositoryInterface;
use App\Modules\Assessment\Repositories\Contracts\AttemptRepositoryInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;

class GradingService
{
    public function __construct(
        private readonly AttemptRepositoryInterface $attemptRepository,
        private readonly AnswerRepositoryInterface $answerRepository,
    ) {}

    public function queue(User $teacher): Collection
    {
        return $this->attemptRepository->gradingQueueForTeacher($teacher);
    }

    public function gradeAnswer(User $teacher, string $attemptId, string $answerId, int $score, ?string $feedback = null): QuizAttempt
    {
        $attempt = $this->attemptRepository->find($attemptId);

        if (! $attempt) {
            throw new ModelNotFoundException('Attempt not found.');
        }

        $this->assertTeacherOwnsCourse($teacher, $attempt);

        $answer = $this->answerRepository->findForAttempt($attempt, $answerId);

        if (! $answer) {
            throw new ModelNotFoundException('Answer not found.');
        }

        if (! $answer->question->requiresManualGrading() &&
            ! ($answer->question->type === 'code' && $answer->auto_score === null)) {
            throw new AuthorizationException('This answer does not require manual grading.');
        }

        if ($score < 0 || $score > $answer->question->points) {
            throw new \InvalidArgumentException('Score must be between 0 and the question point value.');
        }

        $this->answerRepository->grade($answer, $teacher, $score, $feedback);

        return $this->attemptRepository->find($attempt->id);
    }

    public function complete(User $teacher, string $attemptId, ?string $overallFeedback = null): QuizAttempt
    {
        $attempt = $this->attemptRepository->find($attemptId);

        if (! $attempt) {
            throw new ModelNotFoundException('Attempt not found.');
        }

        $this->assertTeacherOwnsCourse($teacher, $attempt);

        if ($attempt->status !== 'submitted') {
            throw new AuthorizationException('Only submitted attempts can be finalized.');
        }

        if ($attempt->needsManualGrading()) {
            throw new AuthorizationException('All manual answers must be graded before completing.');
        }

        $manualScore = $attempt->answers->sum(fn ($a) => $a->manual_score ?? 0);
        $autoScore = $attempt->answers->sum(fn ($a) => $a->manual_score === null ? ($a->auto_score ?? 0) : 0);
        $totalScore = $attempt->answers->sum(fn ($a) => $a->effectiveScore() ?? 0);

        return $this->attemptRepository->update($attempt, [
            'status'            => 'graded',
            'manual_score'      => $manualScore,
            'auto_score'        => $autoScore,
            'total_score'       => $totalScore,
            'overall_feedback'  => $overallFeedback,
        ]);
    }

    private function assertTeacherOwnsCourse(User $teacher, QuizAttempt $attempt): void
    {
        if ($attempt->quiz->course->instructor_id !== $teacher->id) {
            throw new AuthorizationException('You do not have access to grade this attempt.');
        }
    }
}
