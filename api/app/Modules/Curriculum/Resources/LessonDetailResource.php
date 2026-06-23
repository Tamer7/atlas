<?php

namespace App\Modules\Curriculum\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $progress = $this->progressForUser ?? null;

        return [
            'id'               => $this->id,
            'module_id'        => $this->module_id,
            'number'           => $this->number,
            'title'            => $this->title,
            'duration_seconds' => $this->duration_seconds,
            'content_type'     => $this->content_type,
            'body'             => $this->body,
            'video_url'        => $this->video_url,
            'chapters'         => $this->chapters,
            'transcript'       => $this->transcript,
            'attachments'      => $this->attachments,
            'quiz_id'          => $this->quiz_id,
            'progress'         => $progress ? [
                'position_seconds' => $progress->position_seconds,
                'completed_at'     => $progress->completed_at?->toJSON(),
                'notes'            => $progress->notes,
            ] : null,
        ];
    }
}
