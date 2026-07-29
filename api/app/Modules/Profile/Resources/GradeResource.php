<?php

namespace App\Modules\Profile\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GradeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'quiz_id'      => $this->quiz_id,
            'status'       => $this->status,
            'submitted_at' => $this->submitted_at?->toJSON(),
            'total_score'  => $this->status === 'graded' ? $this->total_score : null,
            'quiz'         => $this->whenLoaded('quiz', fn () => [
                'id'            => $this->quiz->id,
                'title'         => $this->quiz->title,
                'quiz_type'     => $this->quiz->quiz_type,
                'passing_score' => $this->quiz->passing_score,
            ]),
            'course'       => $this->when(
                $this->relationLoaded('quiz') && $this->quiz->relationLoaded('course'),
                fn () => [
                    'id'    => $this->quiz->course->id,
                    'title' => $this->quiz->course->title,
                    'tag'   => $this->quiz->course->tag,
                ],
            ),
        ];
    }
}
