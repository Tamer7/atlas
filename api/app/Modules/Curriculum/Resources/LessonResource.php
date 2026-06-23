<?php

namespace App\Modules\Curriculum\Resources;

use App\Models\LessonProgress;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var LessonProgress|null $progress */
        $progress = $this->progressForUser ?? null;
        $isDone = $progress?->completed_at !== null;

        return [
            'id'               => $this->id,
            'number'           => $this->number,
            'title'            => $this->title,
            'duration_seconds' => $this->duration_seconds ?? 0,
            'status'           => $isDone ? 'done' : 'available',
            'has_quiz'         => $this->quiz_id !== null,
            'quiz_id'          => $this->quiz_id,
            'content_type'     => $this->content_type,
            'is_locked'        => false,
        ];
    }
}
