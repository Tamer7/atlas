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
            'courses_count'  => $this->whenCounted('enrollments'),
            'attendance_pct' => 0,
            'avg_score'      => 0,
            'status'         => 'on_track',
            'last_active_at' => null,
            'flagged'        => false,
            'score_trend'    => [],
        ];
    }
}
