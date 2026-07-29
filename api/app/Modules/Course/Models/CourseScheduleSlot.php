<?php

namespace App\Modules\Course\Models;

use App\Models\Course;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseScheduleSlot extends Model
{
    use HasUuids;

    protected $fillable = [
        'course_id',
        'day_of_week',
        'start_time',
        'end_time',
        'label',
    ];

    protected $casts = [
        'day_of_week' => 'integer',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
