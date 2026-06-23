<?php

namespace App\Modules\Curriculum\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ModuleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'      => $this->id,
            'title'   => $this->title,
            'order'   => $this->sort_order,
            'lessons' => LessonResource::collection($this->whenLoaded('lessons')),
        ];
    }
}
