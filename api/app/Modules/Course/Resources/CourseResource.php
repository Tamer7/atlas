<?php

namespace App\Modules\Course\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'title'          => $this->title,
            'tag'            => $this->tag,
            'category'       => $this->category,
            'description'    => $this->description,
            'glyph'          => $this->glyph,
            'thumb_gradient' => $this->thumb_gradient,
            'instructor'     => [
                'id'   => $this->instructor->id,
                'name' => $this->instructor->name,
            ],
            'lessons_total'  => 0,
            'lessons_done'   => 0,
            'progress'       => 0,
        ];
    }
}
