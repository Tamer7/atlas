<?php

namespace App\Modules\Curriculum\Repositories\Contracts;

use App\Models\Lesson;

interface LessonRepositoryInterface
{
    public function find(string $id): ?Lesson;

    public function create(array $data): Lesson;

    public function update(Lesson $lesson, array $data): Lesson;

    public function delete(Lesson $lesson): void;

    public function nextSortOrder(string $moduleId): int;

    public function nextNumber(string $moduleId): int;
}
