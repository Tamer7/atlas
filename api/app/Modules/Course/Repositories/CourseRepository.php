<?php

namespace App\Modules\Course\Repositories;

use App\Models\Course;
use App\Models\User;
use App\Modules\Course\Repositories\Contracts\CourseRepositoryInterface;
use Illuminate\Support\Collection;

class CourseRepository implements CourseRepositoryInterface
{
    public function find(string $id): ?Course
    {
        return Course::with('instructor')->find($id);
    }

    public function listForUser(User $user): Collection
    {
        if ($user->hasRole('teacher')) {
            return Course::with('instructor')
                ->where('instructor_id', $user->id)
                ->orderBy('title')
                ->get();
        }

        return Course::with('instructor')
            ->whereHas('enrollments', fn ($q) => $q->where('user_id', $user->id))
            ->orderBy('title')
            ->get();
    }

    public function create(array $data): Course
    {
        return Course::create($data);
    }

    public function update(Course $course, array $data): Course
    {
        $course->update($data);

        return $course->fresh(['instructor']);
    }
}
