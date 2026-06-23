<?php

namespace App\Modules\Curriculum\Repositories\Contracts;

use App\Models\LessonProgress;

interface LessonProgressRepositoryInterface
{
    public function findForUser(string $userId, string $lessonId): ?LessonProgress;

    public function upsert(string $userId, string $lessonId, array $data): LessonProgress;

    public function updateNotes(string $userId, string $lessonId, string $notes): LessonProgress;

    public function mapForUserAndLessons(string $userId, array $lessonIds): \Illuminate\Support\Collection;
}
