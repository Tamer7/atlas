<?php

namespace App\Modules\Curriculum\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiscussionPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'body'       => $this->body,
            'created_at' => $this->created_at?->toJSON(),
            'user'       => [
                'id'    => $this->user->id,
                'name'  => $this->user->name,
                'color' => $this->user->color,
            ],
            'replies'    => DiscussionPostResource::collection($this->whenLoaded('replies')),
        ];
    }
}
