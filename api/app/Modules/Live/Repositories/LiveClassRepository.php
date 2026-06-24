<?php

namespace App\Modules\Live\Repositories;

use App\Models\LiveClass;
use App\Models\User;
use App\Modules\Live\Repositories\Contracts\LiveClassRepositoryInterface;
use Illuminate\Support\Collection;

class LiveClassRepository implements LiveClassRepositoryInterface
{
    public function create(array $data): LiveClass
    {
        return LiveClass::create($data);
    }

    public function find(string $id): ?LiveClass
    {
        return LiveClass::with(['teacher', 'course'])->find($id);
    }

    public function listForCourse(string $courseId): Collection
    {
        return LiveClass::with(['teacher'])
            ->where('course_id', $courseId)
            ->orderByDesc('scheduled_at')
            ->get();
    }

    public function listForTeacher(User $teacher): Collection
    {
        return LiveClass::with(['course'])
            ->where('teacher_id', $teacher->id)
            ->orderByDesc('scheduled_at')
            ->get();
    }

    public function listForStudent(User $student): Collection
    {
        $courseIds = \App\Models\Enrollment::where('user_id', $student->id)
            ->pluck('course_id');

        return LiveClass::with(['teacher', 'course'])
            ->whereIn('course_id', $courseIds)
            ->whereIn('status', ['scheduled', 'live'])
            ->orderByDesc('scheduled_at')
            ->get();
    }

    public function update(LiveClass $class, array $data): LiveClass
    {
        $class->update($data);
        return $class->fresh(['teacher', 'course']);
    }
}
