<?php

namespace App\Modules\Enrollment\Repositories\Contracts;

use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Support\Collection;

interface EnrollmentRepositoryInterface
{
    public function enroll(User $user, string $courseId): Enrollment;

    public function isEnrolled(User $user, string $courseId): bool;

    public function remove(User $user, string $courseId): void;

    /** @return Collection<int, User> */
    public function studentsForCourse(string $courseId): Collection;

    /** @return Collection<int, User> */
    public function studentsForTeacher(User $teacher): Collection;

    public function coursesCountForUser(User $user): int;
}
