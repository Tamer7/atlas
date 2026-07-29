<?php

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizResource extends JsonResource
{
    public function __construct($resource, private readonly bool $includeAnswers = false)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'course_id'          => $this->course_id,
            'lesson_id'          => $this->lesson_id,
            'title'              => $this->title,
            'quiz_type'          => $this->quiz_type,
            'time_limit_minutes' => $this->time_limit_minutes,
            'max_attempts'       => $this->max_attempts,
            'shuffle_questions'  => $this->shuffle_questions,
            'show_results'       => $this->show_results,
            'passing_score'      => $this->passing_score,
            'show_correct'       => $this->show_correct,
            'show_score'         => $this->show_score,
            'published_at'       => $this->published_at?->toJSON(),
            'due_at'             => $this->due_at?->toJSON(),
            'created_by'         => $this->created_by,
            'questions_count'    => $this->when(isset($this->questions_count), $this->questions_count),
            'questions'          => $this->whenLoaded(
                'questions',
                fn () => QuizQuestionResource::collection(
                    $this->questions->map(fn ($q) => new QuizQuestionResource($q, $this->includeAnswers)),
                ),
            ),
            'created_at'         => $this->created_at?->toJSON(),
            'updated_at'         => $this->updated_at?->toJSON(),
        ];
    }
}
