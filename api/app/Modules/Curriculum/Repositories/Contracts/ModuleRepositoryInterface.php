<?php

namespace App\Modules\Curriculum\Repositories\Contracts;

use App\Models\Module;
use Illuminate\Support\Collection;

interface ModuleRepositoryInterface
{
    public function find(string $id): ?Module;

    public function listForCourse(string $courseId): Collection;

    public function create(array $data): Module;

    public function update(Module $module, array $data): Module;

    public function delete(Module $module): void;

    public function nextSortOrder(string $courseId): int;
}
