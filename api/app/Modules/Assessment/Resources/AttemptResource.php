<?php

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttemptResource extends JsonResource
{
    public function __construct($resource, private readonly bool $showCorrect = false)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'quiz_id'          => $this->quiz_id,
            'user_id'          => $this->user_id,
            'status'           => $this->status,
            'started_at'       => $this->started_at?->toJSON(),
            'submitted_at'     => $this->submitted_at?->toJSON(),
            'auto_score'       => $this->when($this->canShowScore(), $this->auto_score),
            'manual_score'     => $this->when($this->canShowScore(), $this->manual_score),
            'total_score'      => $this->when($this->canShowScore(), $this->total_score),
            'overall_feedback' => $this->when($this->status === 'graded', $this->overall_feedback),
            'quiz'             => $this->whenLoaded('quiz', fn () => new QuizResource(
                $this->quiz,
                $this->showCorrect,
            )),
            'user'             => $this->whenLoaded('user', fn () => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ]),
            'answers'          => $this->whenLoaded('answers', function () {
                return $this->answers->map(fn ($answer) => [
                    'id'           => $answer->id,
                    'question_id'  => $answer->question_id,
                    'answer'       => $answer->answer,
                    'auto_score'   => $this->canShowScore() ? $answer->auto_score : null,
                    'manual_score' => $this->canShowScore() ? $answer->manual_score : null,
                    'feedback'     => $this->status === 'graded' ? $answer->feedback : null,
                    'question'     => $answer->relationLoaded('question')
                        ? new QuizQuestionResource($answer->question, $this->showCorrect)
                        : null,
                ]);
            }),
        ];
    }

    private function canShowScore(): bool
    {
        if ($this->status === 'in_progress') {
            return false;
        }

        if ($this->showCorrect || $this->status === 'graded') {
            return true;
        }

        $quiz = $this->relationLoaded('quiz') ? $this->quiz : null;

        return $quiz
            && $quiz->show_score
            && $quiz->show_results === 'after'
            && in_array($this->status, ['submitted', 'graded'], true);
    }
}
