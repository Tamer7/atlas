<?php

namespace App\Modules\Enrollment\Services;

use App\Models\Course;
use App\Models\User;
use App\Modules\Enrollment\Repositories\Contracts\EnrollmentRepositoryInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;

class TeacherStudentService
{
    public function __construct(
        private readonly EnrollmentRepositoryInterface $enrollmentRepository,
    ) {}

    public function listForTeacher(User $teacher): Collection
    {
        return $this->enrollmentRepository->studentsForTeacher($teacher);
    }

    public function listForCourse(User $teacher, string $courseId): Collection
    {
        $this->assertOwnsCourse($teacher, $courseId);

        return $this->enrollmentRepository->studentsForCourse($courseId);
    }

    public function addToCourse(User $teacher, string $courseId, string $email): User
    {
        $this->assertOwnsCourse($teacher, $courseId);

        $student = User::where('email', $email)->first();

        if (! $student) {
            throw new ModelNotFoundException('No account found with that email.');
        }

        $this->enrollmentRepository->enroll($student, $courseId);

        return $student;
    }

    public function removeFromCourse(User $teacher, string $courseId, string $userId): void
    {
        $this->assertOwnsCourse($teacher, $courseId);

        $student = User::find($userId);

        if (! $student) {
            throw new ModelNotFoundException('Student not found.');
        }

        $this->enrollmentRepository->remove($student, $courseId);
    }

    private function assertOwnsCourse(User $teacher, string $courseId): void
    {
        $owns = Course::where('id', $courseId)
            ->where('instructor_id', $teacher->id)
            ->exists();

        if (! $owns) {
            throw new AuthorizationException('You do not have access to this course.');
        }
    }
}
