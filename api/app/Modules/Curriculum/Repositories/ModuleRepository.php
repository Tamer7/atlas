<?php

namespace App\Modules\Curriculum\Repositories;

use App\Models\Module;
use App\Modules\Curriculum\Repositories\Contracts\ModuleRepositoryInterface;
use Illuminate\Support\Collection;

class ModuleRepository implements ModuleRepositoryInterface
{
    public function find(string $id): ?Module
    {
        return Module::with('course')->find($id);
    }

    public function listForCourse(string $courseId): Collection
    {
        return Module::with(['lessons'])
            ->where('course_id', $courseId)
            ->orderBy('sort_order')
            ->get();
    }

    public function create(array $data): Module
    {
        return Module::create($data);
    }

    public function update(Module $module, array $data): Module
    {
        $module->update($data);

        return $module->fresh(['lessons']);
    }

    public function delete(Module $module): void
    {
        $module->delete();
    }

    public function nextSortOrder(string $courseId): int
    {
        $max = Module::where('course_id', $courseId)->max('sort_order');

        return ($max ?? -1) + 1;
    }
}
