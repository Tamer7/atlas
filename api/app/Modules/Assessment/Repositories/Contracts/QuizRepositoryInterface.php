<?php

namespace App\Modules\Assessment\Repositories\Contracts;

use App\Models\Quiz;
use Illuminate\Support\Collection;

interface QuizRepositoryInterface
{
    public function find(string $id): ?Quiz;

    public function findForCourse(string $courseId, string $id): ?Quiz;

    public function listForCourse(string $courseId): Collection;

    public function listForTeacher(string $teacherId): Collection;

    public function create(array $data, array $questions): Quiz;

    public function update(Quiz $quiz, array $data, ?array $questions = null): Quiz;

    public function delete(Quiz $quiz): void;

    public function publish(Quiz $quiz): Quiz;
}
