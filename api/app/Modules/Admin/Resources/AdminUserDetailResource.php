<?php

namespace App\Modules\Admin\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUserDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'role'       => $this->roles->pluck('name')->first(),
            'is_active'  => $this->deactivated_at === null,
            'created_at' => $this->created_at?->toIso8601String(),

            'courses' => $this->courses->map(fn ($course) => [
                'id'    => $course->id,
                'title' => $course->title,
            ])->values(),

            'enrollments' => $this->enrollments->map(fn ($enrollment) => [
                'id'          => $enrollment->id,
                'course_id'   => $enrollment->course_id,
                'enrolled_at' => $enrollment->enrolled_at?->toIso8601String(),
            ])->values(),
        ];
    }
}
