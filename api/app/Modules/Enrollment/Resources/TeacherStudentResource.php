<?php

namespace App\Modules\Enrollment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherStudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'email'          => $this->email,
            'color'          => $this->color,
            'courses_count'  => $this->teacherCoursesCount ?? 0,
            'attendance_pct' => $this->attendancePct ?? 0,
            'avg_score'      => $this->avgScore ?? 0,
            'status'         => $this->studentStatus ?? 'on_track',
            'last_active_at' => $this->lastActiveAt
                ? (\Illuminate\Support\Carbon::parse($this->lastActiveAt))->toJSON()
                : null,
            'flagged'        => false,
            'score_trend'    => [],
        ];
    }
}
