<?php

namespace App\Modules\Profile\Services;

use App\Models\User;
use App\Modules\Profile\Repositories\Contracts\StudentCommentRepositoryInterface;
use App\Modules\Profile\Repositories\Contracts\StudentRecordRepositoryInterface;
use Illuminate\Support\Collection;

class StudentProfileService
{
    public function __construct(
        private readonly StudentRecordRepositoryInterface $records,
        private readonly StudentCommentRepositoryInterface $comments,
    ) {}

    public function grades(User $student): Collection
    {
        return $this->records->gradedAttemptsForStudent($student);
    }

    public function dueAssignments(User $student): Collection
    {
        $quizzes = $this->records->dueQuizzesForStudent($student);
        $statuses = $this->records->latestAttemptStatusByQuiz($student, $quizzes->pluck('id')->all());

        $quizzes->each(function ($quiz) use ($statuses) {
            $quiz->attemptStatusForStudent = $statuses->get($quiz->id);
        });

        // Keep upcoming work plus anything overdue that was never finished;
        // drop past-due quizzes the student already completed.
        return $quizzes
            ->filter(function ($quiz) {
                $completed = in_array($quiz->attemptStatusForStudent, ['submitted', 'graded'], true);

                return $quiz->due_at->isFuture() || ! $completed;
            })
            ->values();
    }

    public function commentsAboutStudent(User $student): Collection
    {
        return $this->comments->listForStudent($student->id);
    }
}
