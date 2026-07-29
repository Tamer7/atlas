<?php

namespace App\Modules\Profile\Repositories\Contracts;

use App\Modules\Profile\Models\StudentComment;
use Illuminate\Support\Collection;

interface StudentCommentRepositoryInterface
{
    /** @return Collection<int, StudentComment> */
    public function listForStudent(string $studentId): Collection;

    public function find(string $id): ?StudentComment;

    public function create(array $data): StudentComment;

    public function update(StudentComment $comment, array $data): StudentComment;

    public function delete(StudentComment $comment): void;
}
