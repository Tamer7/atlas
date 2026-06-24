<?php

namespace App\Modules\Live\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LiveClassResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'course_id'     => $this->course_id,
            'title'         => $this->title,
            'description'   => $this->description,
            'room_name'     => $this->room_name,
            'status'        => $this->status,
            'scheduled_at'  => $this->scheduled_at?->toIso8601String(),
            'started_at'    => $this->started_at?->toIso8601String(),
            'ended_at'      => $this->ended_at?->toIso8601String(),
            'recording_url' => $this->recording_url,
            'teacher'       => [
                'id'    => $this->teacher?->id,
                'name'  => $this->teacher?->name,
                'color' => $this->teacher?->color,
            ],
            'course'        => $this->when($this->relationLoaded('course'), [
                'id'    => $this->course?->id,
                'title' => $this->course?->title,
            ]),
        ];
    }
}
