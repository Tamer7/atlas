<?php

namespace App\Modules\Enrollment\Repositories;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Modules\Enrollment\Repositories\Contracts\EnrollmentRepositoryInterface;
use Illuminate\Support\Collection;

class EnrollmentRepository implements EnrollmentRepositoryInterface
{
    public function enroll(User $user, string $courseId): Enrollment
    {
        return Enrollment::firstOrCreate(
            ['user_id' => $user->id, 'course_id' => $courseId],
            ['enrolled_at' => now()],
        );
    }

    public function isEnrolled(User $user, string $courseId): bool
    {
        return Enrollment::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->exists();
    }

    public function remove(User $user, string $courseId): void
    {
        Enrollment::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->delete();
    }

    public function studentsForCourse(string $courseId): Collection
    {
        return User::whereHas('enrollments', fn ($q) => $q->where('course_id', $courseId))
            ->orderBy('name')
            ->get();
    }

    public function studentsForTeacher(User $teacher): Collection
    {
        $courseIds = Course::where('instructor_id', $teacher->id)->pluck('id');

        return User::whereHas('enrollments', fn ($q) => $q->whereIn('course_id', $courseIds))
            ->distinct()
            ->orderBy('name')
            ->get();
    }

    public function coursesCountForUser(User $user): int
    {
        return Enrollment::where('user_id', $user->id)->count();
    }
}
