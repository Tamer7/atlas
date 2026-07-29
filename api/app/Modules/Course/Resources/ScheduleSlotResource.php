<?php

namespace App\Modules\Course\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScheduleSlotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'course_id'   => $this->course_id,
            'day_of_week' => $this->day_of_week,
            'start_time'  => substr((string) $this->start_time, 0, 5),
            'end_time'    => substr((string) $this->end_time, 0, 5),
            'label'       => $this->label,
            'course'      => $this->whenLoaded('course', fn () => [
                'id'             => $this->course->id,
                'title'          => $this->course->title,
                'tag'            => $this->course->tag,
                'thumb_gradient' => $this->course->thumb_gradient,
                'glyph'          => $this->course->glyph,
            ]),
        ];
    }
}
