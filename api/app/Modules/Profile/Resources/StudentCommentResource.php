<?php

namespace App\Modules\Profile\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentCommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'student_id' => $this->student_id,
            'body'       => $this->body,
            'created_at' => $this->created_at?->toJSON(),
            'updated_at' => $this->updated_at?->toJSON(),
            'teacher'    => $this->whenLoaded('teacher', fn () => [
                'id'   => $this->teacher->id,
                'name' => $this->teacher->name,
            ]),
            'course'     => $this->whenLoaded('course', fn () => $this->course ? [
                'id'    => $this->course->id,
                'title' => $this->course->title,
                'tag'   => $this->course->tag,
            ] : null),
        ];
    }
}
