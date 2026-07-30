<?php

namespace App\Modules\Live\Repositories\Contracts;

use App\Models\LiveClass;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

interface LiveClassRepositoryInterface
{
    public function create(array $data): LiveClass;

    public function find(string $id): ?LiveClass;

    /**
     * Idempotently materialise the LiveClass row for one schedule-slot
     * occurrence. Looks up by ['schedule_slot_id', 'scheduled_at'] first;
     * $attributes are only used as the creation values when no row exists.
     */
    public function firstOrCreateForSlot(string $slotId, CarbonInterface $scheduledAt, array $attributes): LiveClass;

    public function listForCourse(string $courseId): Collection;

    public function listForTeacher(User $teacher): Collection;

    public function listForStudent(User $student): Collection;

    public function update(LiveClass $class, array $data): LiveClass;
}
