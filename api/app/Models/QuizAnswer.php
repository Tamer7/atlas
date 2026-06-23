<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAnswer extends Model
{
    use HasUuids;

    protected $fillable = [
        'attempt_id',
        'question_id',
        'answer',
        'auto_score',
        'manual_score',
        'feedback',
        'ai_suggested_score',
        'ai_notes',
        'graded_at',
        'graded_by',
    ];

    protected function casts(): array
    {
        return [
            'answer'    => 'array',
            'graded_at' => 'datetime',
        ];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(QuizAttempt::class, 'attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class, 'question_id');
    }

    public function grader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    public function effectiveScore(): ?int
    {
        if ($this->manual_score !== null) {
            return $this->manual_score;
        }

        return $this->auto_score;
    }
}
