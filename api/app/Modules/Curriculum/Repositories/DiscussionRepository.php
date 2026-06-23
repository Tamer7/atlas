<?php

namespace App\Modules\Curriculum\Repositories;

use App\Models\LessonDiscussionPost;
use App\Modules\Curriculum\Repositories\Contracts\DiscussionRepositoryInterface;
use Illuminate\Support\Collection;

class DiscussionRepository implements DiscussionRepositoryInterface
{
    public function listForLesson(string $lessonId): Collection
    {
        return LessonDiscussionPost::with(['user', 'replies.user'])
            ->where('lesson_id', $lessonId)
            ->whereNull('parent_id')
            ->orderBy('created_at')
            ->get();
    }

    public function create(array $data): LessonDiscussionPost
    {
        return LessonDiscussionPost::create($data)->load(['user', 'replies.user']);
    }
}
