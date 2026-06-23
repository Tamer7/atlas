<?php

namespace App\Modules\Course\Resources;

use App\Modules\Curriculum\Resources\ModuleResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseDetailResource extends JsonResource
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
            'lessons_total'  => $this->lessonsTotal ?? 0,
            'lessons_done'   => $this->lessonsDone ?? 0,
            'progress'       => $this->progressPct ?? 0,
            'modules'        => ModuleResource::collection($this->whenLoaded('modules')),
        ];
    }
}
