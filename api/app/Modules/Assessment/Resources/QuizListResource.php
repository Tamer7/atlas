<?php

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'course_id'       => $this->course_id,
            'course_title'    => $this->whenLoaded('course', fn () => $this->course->title),
            'title'           => $this->title,
            'quiz_type'       => $this->quiz_type,
            'questions_count' => $this->questions_count ?? $this->questions?->count() ?? 0,
            'published_at'    => $this->published_at?->toJSON(),
            'due_at'          => $this->due_at?->toJSON(),
            'updated_at'      => $this->updated_at?->toJSON(),
        ];
    }
}
