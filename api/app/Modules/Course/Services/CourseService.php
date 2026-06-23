<?php

namespace App\Modules\Course\Services;

use App\Models\Course;
use App\Models\User;
use App\Modules\Course\Repositories\Contracts\CourseRepositoryInterface;
use App\Modules\Course\Support\CourseProgress;
use App\Modules\Curriculum\Repositories\Contracts\LessonProgressRepositoryInterface;
use App\Modules\Enrollment\Repositories\Contracts\EnrollmentRepositoryInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CourseService
{
    public function __construct(
        private readonly CourseRepositoryInterface $courseRepository,
        private readonly EnrollmentRepositoryInterface $enrollmentRepository,
        private readonly LessonProgressRepositoryInterface $progressRepository,
    ) {}

    public function list(User $user): \Illuminate\Support\Collection
    {
        $courses = $this->courseRepository->listForUser($user);
        CourseProgress::attach($courses, $user, $this->progressRepository);

        return $courses;
    }

    public function show(User $user, string $courseId): Course
    {
        $course = $this->courseRepository->find($courseId);

        if (! $course) {
            throw new ModelNotFoundException('Course not found.');
        }

        $this->assertCanView($user, $course);
        CourseProgress::attach($course, $user, $this->progressRepository);

        return $course;
    }

    public function create(User $teacher, array $data): Course
    {
        return $this->courseRepository->create([
            'title'          => $data['title'],
            'tag'            => $data['tag'],
            'category'       => $data['category'],
            'description'    => $data['description'] ?? null,
            'glyph'          => $data['glyph'] ?? null,
            'thumb_gradient' => $data['thumb_gradient'] ?? 'grad-1',
            'instructor_id'  => $teacher->id,
        ])->load('instructor');
    }

    public function update(User $teacher, string $courseId, array $data): Course
    {
        $course = $this->courseRepository->find($courseId);

        if (! $course) {
            throw new ModelNotFoundException('Course not found.');
        }

        $this->assertIsInstructor($teacher, $course);

        return $this->courseRepository->update($course, $data);
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

    private function assertIsInstructor(User $teacher, Course $course): void
    {
        if ($course->instructor_id !== $teacher->id) {
            throw new AuthorizationException('You do not have access to this course.');
        }
    }
}
