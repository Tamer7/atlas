<?php

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GradingQueueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $pendingAnswers = $this->answers->filter(
            fn ($answer) => $answer->manual_score === null
                && ($answer->question->requiresManualGrading()
                    || ($answer->question->type === 'code' && $answer->auto_score === null)),
        );

        return [
            'attempt_id'    => $this->id,
            'quiz_id'       => $this->quiz_id,
            'quiz_title'    => $this->quiz->title,
            'course_id'     => $this->quiz->course_id,
            'course_title'  => $this->quiz->course->title,
            'student'       => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ],
            'submitted_at'  => $this->submitted_at?->toJSON(),
            'pending_count' => $pendingAnswers->count(),
            'answers'       => $pendingAnswers->map(fn ($answer) => [
                'id'          => $answer->id,
                'question_id' => $answer->question_id,
                'type'        => $answer->question->type,
                'prompt'      => $answer->question->prompt,
                'points'      => $answer->question->points,
                'answer'      => $answer->answer,
            ])->values(),
        ];
    }
}
