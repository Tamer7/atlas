<?php

namespace App\Modules\Profile\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DueAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'title'           => $this->title,
            'quiz_type'       => $this->quiz_type,
            'due_at'          => $this->due_at?->toJSON(),
            'questions_count' => $this->questions_count ?? 0,
            'attempt_status'  => $this->attemptStatusForStudent,
            'course'          => $this->whenLoaded('course', fn () => [
                'id'    => $this->course->id,
                'title' => $this->course->title,
                'tag'   => $this->course->tag,
            ]),
        ];
    }
}
