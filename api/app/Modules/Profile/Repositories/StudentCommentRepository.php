<?php

namespace App\Modules\Profile\Repositories;

use App\Modules\Profile\Models\StudentComment;
use App\Modules\Profile\Repositories\Contracts\StudentCommentRepositoryInterface;
use Illuminate\Support\Collection;

class StudentCommentRepository implements StudentCommentRepositoryInterface
{
    public function listForStudent(string $studentId): Collection
    {
        return StudentComment::with(['teacher:id,name', 'course:id,title,tag'])
            ->where('student_id', $studentId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function find(string $id): ?StudentComment
    {
        return StudentComment::with(['teacher:id,name', 'course:id,title,tag'])->find($id);
    }

    public function create(array $data): StudentComment
    {
        return StudentComment::create($data)->load(['teacher:id,name', 'course:id,title,tag']);
    }

    public function update(StudentComment $comment, array $data): StudentComment
    {
        $comment->update($data);

        return $comment->fresh(['teacher:id,name', 'course:id,title,tag']);
    }

    public function delete(StudentComment $comment): void
    {
        $comment->delete();
    }
}
