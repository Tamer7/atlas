<?php

namespace App\Modules\Course\Repositories;

use App\Models\User;
use App\Modules\Course\Models\CourseScheduleSlot;
use App\Modules\Course\Repositories\Contracts\ScheduleRepositoryInterface;
use Illuminate\Support\Collection;

class ScheduleRepository implements ScheduleRepositoryInterface
{
    public function listForCourse(string $courseId): Collection
    {
        return CourseScheduleSlot::with('course:id,title,instructor_id')
            ->where('course_id', $courseId)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();
    }

    public function listForUser(User $user): Collection
    {
        // instructor_id is not rendered by ScheduleSlotResource but is needed
        // by LiveService's materialisation (teacher_id for the created class).
        $query = CourseScheduleSlot::with('course:id,title,tag,thumb_gradient,glyph,instructor_id');

        if ($user->hasRole('teacher')) {
            $query->whereHas('course', fn ($q) => $q->where('instructor_id', $user->id));
        } else {
            $query->whereHas('course.enrollments', fn ($q) => $q->where('user_id', $user->id));
        }

        return $query
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();
    }

    public function find(string $id): ?CourseScheduleSlot
    {
        return CourseScheduleSlot::with('course')->find($id);
    }

    public function create(array $data): CourseScheduleSlot
    {
        return CourseScheduleSlot::create($data);
    }

    public function update(CourseScheduleSlot $slot, array $data): CourseScheduleSlot
    {
        $slot->update($data);

        return $slot->fresh();
    }

    public function delete(CourseScheduleSlot $slot): void
    {
        $slot->delete();
    }
}
