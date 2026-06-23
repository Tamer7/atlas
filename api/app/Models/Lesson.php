<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    use HasUuids;

    protected $fillable = [
        'module_id',
        'title',
        'number',
        'duration_seconds',
        'sort_order',
        'content_type',
        'body',
        'video_url',
        'chapters',
        'transcript',
        'attachments',
        'quiz_id',
    ];

    protected function casts(): array
    {
        return [
            'chapters'    => 'array',
            'transcript'  => 'array',
            'attachments' => 'array',
        ];
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function discussionPosts(): HasMany
    {
        return $this->hasMany(LessonDiscussionPost::class)->whereNull('parent_id')->orderBy('created_at');
    }
}
