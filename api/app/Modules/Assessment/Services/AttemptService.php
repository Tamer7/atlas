<?php

namespace App\Modules\Assessment\Services;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Modules\Assessment\Repositories\Contracts\AnswerRepositoryInterface;
use App\Modules\Assessment\Repositories\Contracts\AttemptRepositoryInterface;
use App\Modules\Assessment\Repositories\Contracts\QuizRepositoryInterface;
use App\Modules\Enrollment\Repositories\Contracts\EnrollmentRepositoryInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AttemptService
{
    public function __construct(
        private readonly QuizRepositoryInterface $quizRepository,
        private readonly AttemptRepositoryInterface $attemptRepository,
        private readonly AnswerRepositoryInterface $answerRepository,
        private readonly EnrollmentRepositoryInterface $enrollmentRepository,
        private readonly AutoGraderService $autoGrader,
    ) {}

    public function start(User $student, string $quizId): QuizAttempt
    {
        $quiz = $this->quizRepository->find($quizId);

        if (! $quiz) {
            throw new ModelNotFoundException('Quiz not found.');
        }

        if (! $quiz->isPublished()) {
            throw new AuthorizationException('This quiz is not available.');
        }

        if (! $this->enrollmentRepository->isEnrolled($student, $quiz->course_id)) {
            throw new AuthorizationException('You are not enrolled in this course.');
        }

        $inProgress = $this->attemptRepository->findInProgress($quiz, $student);

        if ($inProgress) {
            return $inProgress;
        }

        $completedCount = $this->attemptRepository->countCompletedForUser($quiz, $student);

        if ($completedCount >= $quiz->max_attempts) {
            throw new AuthorizationException('Maximum attempts reached for this quiz.');
        }

        $attempt = $this->attemptRepository->create($quiz, $student);

        foreach ($quiz->questions as $question) {
            $this->answerRepository->upsert($attempt, $question, []);
        }

        return $this->attemptRepository->find($attempt->id);
    }

    public function show(User $user, string $attemptId): QuizAttempt
    {
        $attempt = $this->findAttemptOrFail($attemptId);
        $this->assertCanAccessAttempt($user, $attempt);

        return $attempt;
    }

    public function saveAnswers(User $student, string $attemptId, array $answers): QuizAttempt
    {
        $attempt = $this->findAttemptOrFail($attemptId);
        $this->assertIsAttemptOwner($student, $attempt);

        if ($attempt->status !== 'in_progress') {
            throw new AuthorizationException('This attempt can no longer be modified.');
        }

        foreach ($answers as $entry) {
            $question = $attempt->quiz->questions->firstWhere('id', $entry['question_id']);

            if (! $question) {
                continue;
            }

            $this->answerRepository->upsert($attempt, $question, $entry['answer'] ?? []);
        }

        return $this->attemptRepository->find($attempt->id);
    }

    public function submit(User $student, string $attemptId): QuizAttempt
    {
        $attempt = $this->findAttemptOrFail($attemptId);
        $this->assertIsAttemptOwner($student, $attempt);

        if ($attempt->status !== 'in_progress') {
            throw new AuthorizationException('This attempt has already been submitted.');
        }

        $autoScore = $this->autoGradeAttempt($attempt);
        $needsManual = $this->attemptNeedsManualGrading($attempt);

        $status = $needsManual ? 'submitted' : 'graded';
        $totalScore = $needsManual ? null : $this->calculateTotalScore($attempt);

        return $this->attemptRepository->update($attempt, [
            'status'       => $status,
            'submitted_at' => now(),
            'auto_score'   => $autoScore,
            'total_score'  => $totalScore,
        ]);
    }

    public function results(User $user, string $attemptId): QuizAttempt
    {
        $attempt = $this->findAttemptOrFail($attemptId);
        $this->assertCanAccessAttempt($user, $attempt);

        if ($user->hasRole('student')) {
            $this->assertResultsVisible($attempt);
        }

        return $attempt;
    }

    private function autoGradeAttempt(QuizAttempt $attempt): int
    {
        $total = 0;

        foreach ($attempt->answers as $answer) {
            if (! $this->autoGrader->canAutoGrade($answer->question->type)) {
                continue;
            }

            $score = $this->autoGrader->grade($answer->question, $answer->answer);

            if ($score !== null) {
                $this->answerRepository->updateAutoScore($answer, $score);
                $total += $score;
            }
        }

        return $total;
    }

    private function attemptNeedsManualGrading(QuizAttempt $attempt): bool
    {
        $attempt = $this->attemptRepository->find($attempt->id);

        foreach ($attempt->answers as $answer) {
            if ($answer->question->requiresManualGrading()) {
                return true;
            }

            if ($answer->question->type === 'code' && $this->autoGrader->grade($answer->question, $answer->answer) === null) {
                return true;
            }
        }

        return false;
    }

    private function calculateTotalScore(QuizAttempt $attempt): int
    {
        $attempt = $this->attemptRepository->find($attempt->id);
        $total = 0;

        foreach ($attempt->answers as $answer) {
            $total += $answer->effectiveScore() ?? 0;
        }

        return $total;
    }

    private function findAttemptOrFail(string $attemptId): QuizAttempt
    {
        $attempt = $this->attemptRepository->find($attemptId);

        if (! $attempt) {
            throw new ModelNotFoundException('Attempt not found.');
        }

        return $attempt;
    }

    private function assertIsAttemptOwner(User $student, QuizAttempt $attempt): void
    {
        if ($attempt->user_id !== $student->id) {
            throw new AuthorizationException('You do not have access to this attempt.');
        }
    }

    private function assertCanAccessAttempt(User $user, QuizAttempt $attempt): void
    {
        if ($attempt->user_id === $user->id) {
            return;
        }

        if ($user->hasRole('teacher') && $attempt->quiz->course->instructor_id === $user->id) {
            return;
        }

        throw new AuthorizationException('You do not have access to this attempt.');
    }

    private function assertResultsVisible(QuizAttempt $attempt): void
    {
        $quiz = $attempt->quiz;

        if ($attempt->status === 'in_progress') {
            throw new AuthorizationException('Results are not available yet.');
        }

        if ($quiz->show_results === 'never') {
            throw new AuthorizationException('Results are not available for this quiz.');
        }

        if ($quiz->show_results === 'manual' && $attempt->status !== 'graded') {
            throw new AuthorizationException('Results are not available yet.');
        }
    }
}
