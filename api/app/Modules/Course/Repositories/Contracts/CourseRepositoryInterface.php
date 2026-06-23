<?php

namespace App\Modules\Course\Repositories\Contracts;

use App\Models\Course;
use App\Models\User;
use Illuminate\Support\Collection;

interface CourseRepositoryInterface
{
    public function find(string $id): ?Course;

    public function listForUser(User $user): Collection;

    public function create(array $data): Course;

    public function update(Course $course, array $data): Course;
}
