<?php

namespace App\Modules\Course\Support;

use App\Models\Course;
use App\Models\User;
use App\Modules\Curriculum\Repositories\Contracts\LessonProgressRepositoryInterface;
use Illuminate\Support\Collection;

final class CourseProgress
{
    public static function attach(Collection|Course $courses, User $user, LessonProgressRepositoryInterface $progressRepository): void
    {
        $collection = $courses instanceof Course ? collect([$courses]) : $courses;

        $lessonIds = $collection
            ->flatMap(fn (Course $course) => $course->modules->flatMap->lessons)
            ->pluck('id')
            ->all();

        $progressByLesson = $progressRepository->mapForUserAndLessons($user->id, $lessonIds);

        $collection->each(function (Course $course) use ($progressByLesson) {
            $course->modules->each(function ($module) use ($progressByLesson) {
                $module->lessons->each(function ($lesson) use ($progressByLesson) {
                    $lesson->progressForUser = $progressByLesson->get($lesson->id);
                });
            });

            $lessons = $course->modules->flatMap->lessons;
            $total = $lessons->count();
            $done = $lessons->filter(
                fn ($lesson) => $progressByLesson->get($lesson->id)?->completed_at !== null,
            )->count();

            $course->lessonsTotal = $total;
            $course->lessonsDone = $done;
            $course->progressPct = $total > 0 ? (int) round(($done / $total) * 100) : 0;
        });
    }
}
