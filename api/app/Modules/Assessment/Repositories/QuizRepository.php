<?php

namespace App\Modules\Assessment\Repositories;

use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Modules\Assessment\Repositories\Contracts\QuizRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class QuizRepository implements QuizRepositoryInterface
{
    public function find(string $id): ?Quiz
    {
        return Quiz::with(['questions', 'course'])->find($id);
    }

    public function findForCourse(string $courseId, string $id): ?Quiz
    {
        return Quiz::with(['questions', 'course'])
            ->where('course_id', $courseId)
            ->find($id);
    }

    public function listForCourse(string $courseId): Collection
    {
        return Quiz::withCount('questions')
            ->where('course_id', $courseId)
            ->orderBy('title')
            ->get();
    }

    public function listForTeacher(string $teacherId): Collection
    {
        return Quiz::with(['course:id,title'])
            ->withCount('questions')
            ->whereHas('course', fn ($q) => $q->where('instructor_id', $teacherId))
            ->orderByDesc('updated_at')
            ->get();
    }

    public function create(array $data, array $questions): Quiz
    {
        return DB::transaction(function () use ($data, $questions) {
            $quiz = Quiz::create($data);
            $this->syncQuestions($quiz, $questions);

            return $quiz->load('questions');
        });
    }

    public function update(Quiz $quiz, array $data, ?array $questions = null): Quiz
    {
        return DB::transaction(function () use ($quiz, $data, $questions) {
            $quiz->update($data);

            if ($questions !== null) {
                $this->syncQuestions($quiz, $questions);
            }

            return $quiz->fresh(['questions', 'course']);
        });
    }

    public function delete(Quiz $quiz): void
    {
        $quiz->delete();
    }

    public function publish(Quiz $quiz): Quiz
    {
        $quiz->update(['published_at' => now()]);

        return $quiz->fresh(['questions', 'course']);
    }

    /**
     * Questions carrying the id of an existing question are updated in place so
     * student answers referencing them survive; replacing everything would
     * cascade-delete the answers of past attempts.
     */
    private function syncQuestions(Quiz $quiz, array $questions): void
    {
        $existing = $quiz->questions()->get()->keyBy('id');
        $keptIds = [];

        foreach ($questions as $index => $question) {
            $attributes = [
                'type'       => $question['type'],
                'prompt'     => $question['prompt'],
                'points'     => $question['points'] ?? 1,
                'config'     => $question['config'] ?? [],
                'sort_order' => $question['sort_order'] ?? $index,
            ];

            $current = isset($question['id']) ? $existing->get($question['id']) : null;

            if ($current) {
                $current->update($attributes);
                $keptIds[] = $current->id;
            } else {
                $keptIds[] = QuizQuestion::create($attributes + ['quiz_id' => $quiz->id])->id;
            }
        }

        $quiz->questions()->whereNotIn('id', $keptIds)->delete();
    }
}
