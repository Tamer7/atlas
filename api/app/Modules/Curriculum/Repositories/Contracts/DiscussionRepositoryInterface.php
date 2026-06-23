<?php

namespace App\Modules\Curriculum\Repositories\Contracts;

use App\Models\LessonDiscussionPost;
use Illuminate\Support\Collection;

interface DiscussionRepositoryInterface
{
    public function listForLesson(string $lessonId): Collection;

    public function create(array $data): LessonDiscussionPost;
}
