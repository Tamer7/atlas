<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizQuestion extends Model
{
    use HasUuids;

    protected $fillable = ['quiz_id', 'type', 'prompt', 'points', 'config', 'sort_order'];

    protected function casts(): array
    {
        return [
            'config' => 'array',
        ];
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(QuizAnswer::class, 'question_id');
    }

    public function requiresManualGrading(): bool
    {
        return in_array($this->type, ['short', 'essay', 'code', 'upload'], true);
    }
}
