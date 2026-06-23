<?php

namespace App\Modules\Curriculum\Services;

use App\Models\Course;
use App\Models\LessonDiscussionPost;
use App\Models\User;
use App\Modules\Curriculum\Repositories\Contracts\DiscussionRepositoryInterface;
use App\Modules\Curriculum\Repositories\Contracts\LessonRepositoryInterface;
use App\Modules\Enrollment\Repositories\Contracts\EnrollmentRepositoryInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;

class DiscussionService
{
    public function __construct(
        private readonly DiscussionRepositoryInterface $discussionRepository,
        private readonly LessonRepositoryInterface $lessonRepository,
        private readonly EnrollmentRepositoryInterface $enrollmentRepository,
    ) {}

    public function listPosts(User $user, string $lessonId): Collection
    {
        $lesson = $this->findLessonOrFail($lessonId);
        $this->assertCanView($user, $lesson->module->course);

        return $this->discussionRepository->listForLesson($lessonId);
    }

    public function createPost(User $user, string $lessonId, array $data): LessonDiscussionPost
    {
        $lesson = $this->findLessonOrFail($lessonId);
        $this->assertCanView($user, $lesson->module->course);

        return $this->discussionRepository->create([
            'lesson_id' => $lessonId,
            'user_id'   => $user->id,
            'parent_id' => $data['parent_id'] ?? null,
            'body'      => $data['body'],
        ]);
    }

    private function findLessonOrFail(string $lessonId)
    {
        $lesson = $this->lessonRepository->find($lessonId);

        if (! $lesson) {
            throw new ModelNotFoundException('Lesson not found.');
        }

        return $lesson;
    }

    private function assertCanView(User $user, Course $course): void
    {
        if ($user->hasRole('teacher') && $course->instructor_id === $user->id) {
            return;
        }

        if ($this->enrollmentRepository->isEnrolled($user, $course->id)) {
            return;
        }

        throw new AuthorizationException('You do not have access to this course.');
    }
}
