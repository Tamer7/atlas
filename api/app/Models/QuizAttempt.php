<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizAttempt extends Model
{
    use HasUuids;

    protected $fillable = [
        'quiz_id',
        'user_id',
        'status',
        'started_at',
        'submitted_at',
        'auto_score',
        'manual_score',
        'total_score',
        'overall_feedback',
    ];

    protected function casts(): array
    {
        return [
            'started_at'   => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(QuizAnswer::class, 'attempt_id');
    }

    public function needsManualGrading(): bool
    {
        return $this->answers()
            ->whereHas('question', fn ($q) => $q->whereIn('type', ['short', 'essay', 'code', 'upload']))
            ->whereNull('manual_score')
            ->exists();
    }
}
