<?php

namespace App\Modules\Enrollment\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class Invitation extends Model
{
    use HasUuids;

    protected $fillable = ['email', 'invited_by', 'token', 'course_ids', 'expires_at', 'accepted_at'];

    protected $casts = [
        'course_ids'  => 'array',
        'expires_at'  => 'datetime',
        'accepted_at' => 'datetime',
    ];

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }
}
