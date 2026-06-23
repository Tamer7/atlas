<?php

namespace App\Modules\Curriculum\Repositories;

use App\Models\Lesson;
use App\Modules\Curriculum\Repositories\Contracts\LessonRepositoryInterface;

class LessonRepository implements LessonRepositoryInterface
{
    public function find(string $id): ?Lesson
    {
        return Lesson::with(['module.course'])->find($id);
    }

    public function create(array $data): Lesson
    {
        return Lesson::create($data);
    }

    public function update(Lesson $lesson, array $data): Lesson
    {
        $lesson->update($data);

        return $lesson->fresh(['module.course']);
    }

    public function delete(Lesson $lesson): void
    {
        $lesson->delete();
    }

    public function nextSortOrder(string $moduleId): int
    {
        $max = Lesson::where('module_id', $moduleId)->max('sort_order');

        return ($max ?? -1) + 1;
    }

    public function nextNumber(string $moduleId): int
    {
        $max = Lesson::where('module_id', $moduleId)->max('number');

        return ($max ?? 0) + 1;
    }
}
