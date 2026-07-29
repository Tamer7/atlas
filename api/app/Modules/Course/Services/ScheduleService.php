<?php

namespace App\Modules\Course\Services;

use App\Models\Course;
use App\Models\User;
use App\Modules\Course\Models\CourseScheduleSlot;
use App\Modules\Course\Repositories\Contracts\CourseRepositoryInterface;
use App\Modules\Course\Repositories\Contracts\ScheduleRepositoryInterface;
use App\Modules\Enrollment\Repositories\Contracts\EnrollmentRepositoryInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;

class ScheduleService
{
    public function __construct(
        private readonly ScheduleRepositoryInterface $scheduleRepository,
        private readonly CourseRepositoryInterface $courseRepository,
        private readonly EnrollmentRepositoryInterface $enrollmentRepository,
    ) {}

    public function listForCourse(User $user, string $courseId): Collection
    {
        $course = $this->findCourseOrFail($courseId);
        $this->assertCanView($user, $course);

        return $this->scheduleRepository->listForCourse($courseId);
    }

    public function listForUser(User $user): Collection
    {
        return $this->scheduleRepository->listForUser($user);
    }

    public function createSlot(User $teacher, string $courseId, array $data): CourseScheduleSlot
    {
        $course = $this->findCourseOrFail($courseId);
        $this->assertIsInstructor($teacher, $course);

        return $this->scheduleRepository->create([
            'course_id'   => $courseId,
            'day_of_week' => $data['day_of_week'],
            'start_time'  => $data['start_time'],
            'end_time'    => $data['end_time'],
            'label'       => $data['label'] ?? null,
        ]);
    }

    public function updateSlot(User $teacher, string $slotId, array $data): CourseScheduleSlot
    {
        $slot = $this->findSlotOrFail($slotId);
        $this->assertIsInstructor($teacher, $slot->course);

        return $this->scheduleRepository->update($slot, $data);
    }

    public function deleteSlot(User $teacher, string $slotId): void
    {
        $slot = $this->findSlotOrFail($slotId);
        $this->assertIsInstructor($teacher, $slot->course);

        $this->scheduleRepository->delete($slot);
    }

    private function findCourseOrFail(string $courseId): Course
    {
        $course = $this->courseRepository->find($courseId);

        if (! $course) {
            throw new ModelNotFoundException('Course not found.');
        }

        return $course;
    }

    private function findSlotOrFail(string $slotId): CourseScheduleSlot
    {
        $slot = $this->scheduleRepository->find($slotId);

        if (! $slot) {
            throw new ModelNotFoundException('Schedule slot not found.');
        }

        return $slot;
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
