<?php

namespace App\Modules\Live\Repositories\Contracts;

use App\Models\LiveClass;
use App\Models\User;
use Illuminate\Support\Collection;

interface LiveClassRepositoryInterface
{
    public function create(array $data): LiveClass;

    public function find(string $id): ?LiveClass;

    public function listForCourse(string $courseId): Collection;

    public function listForTeacher(User $teacher): Collection;

    public function update(LiveClass $class, array $data): LiveClass;
}
