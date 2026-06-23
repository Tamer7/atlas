<?php

namespace App\Modules\Curriculum\Repositories;

use App\Models\LessonProgress;
use App\Modules\Curriculum\Repositories\Contracts\LessonProgressRepositoryInterface;
use Illuminate\Support\Collection;

class LessonProgressRepository implements LessonProgressRepositoryInterface
{
    public function findForUser(string $userId, string $lessonId): ?LessonProgress
    {
        return LessonProgress::where('user_id', $userId)
            ->where('lesson_id', $lessonId)
            ->first();
    }

    public function upsert(string $userId, string $lessonId, array $data): LessonProgress
    {
        return LessonProgress::updateOrCreate(
            ['user_id' => $userId, 'lesson_id' => $lessonId],
            $data,
        );
    }

    public function updateNotes(string $userId, string $lessonId, string $notes): LessonProgress
    {
        return LessonProgress::updateOrCreate(
            ['user_id' => $userId, 'lesson_id' => $lessonId],
            ['notes' => $notes],
        );
    }

    public function mapForUserAndLessons(string $userId, array $lessonIds): Collection
    {
        if ($lessonIds === []) {
            return collect();
        }

        return LessonProgress::where('user_id', $userId)
            ->whereIn('lesson_id', $lessonIds)
            ->get()
            ->keyBy('lesson_id');
    }
}
