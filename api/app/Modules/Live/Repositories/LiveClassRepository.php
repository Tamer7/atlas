<?php

namespace App\Modules\Live\Repositories;

use App\Models\LiveClass;
use App\Models\User;
use App\Modules\Live\Repositories\Contracts\LiveClassRepositoryInterface;
use Carbon\CarbonInterface;
use Illuminate\Database\QueryException;
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

    public function firstOrCreateForSlot(string $slotId, CarbonInterface $scheduledAt, array $attributes): LiveClass
    {
        $existing = $this->findForSlot($slotId, $scheduledAt);

        if ($existing) {
            return $existing;
        }

        try {
            return LiveClass::create($attributes + [
                'schedule_slot_id' => $slotId,
                'scheduled_at'     => $scheduledAt,
            ]);
        } catch (QueryException $e) {
            // Unique-constraint race: a concurrent request materialised this
            // exact occurrence between our lookup and our insert. Re-read
            // instead of bubbling up — this is what makes materialisation
            // safe under concurrent requests.
            if (($e->errorInfo[0] ?? null) !== '23505') {
                throw $e;
            }

            $existing = $this->findForSlot($slotId, $scheduledAt);

            if (! $existing) {
                throw $e;
            }

            return $existing;
        }
    }

    private function findForSlot(string $slotId, CarbonInterface $scheduledAt): ?LiveClass
    {
        return LiveClass::where('schedule_slot_id', $slotId)
            ->where('scheduled_at', $scheduledAt)
            ->first();
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
