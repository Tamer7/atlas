<?php

namespace App\Modules\Course\Repositories\Contracts;

use App\Models\User;
use App\Modules\Course\Models\CourseScheduleSlot;
use Illuminate\Support\Collection;

interface ScheduleRepositoryInterface
{
    /** @return Collection<int, CourseScheduleSlot> */
    public function listForCourse(string $courseId): Collection;

    /** @return Collection<int, CourseScheduleSlot> */
    public function listForUser(User $user): Collection;

    public function find(string $id): ?CourseScheduleSlot;

    public function create(array $data): CourseScheduleSlot;

    public function update(CourseScheduleSlot $slot, array $data): CourseScheduleSlot;

    public function delete(CourseScheduleSlot $slot): void;
}
