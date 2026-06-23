<?php

namespace App\Modules\Curriculum\Services;

use App\Models\Course;
use App\Models\Module;
use App\Models\User;
use App\Modules\Course\Repositories\Contracts\CourseRepositoryInterface;
use App\Modules\Curriculum\Repositories\Contracts\LessonProgressRepositoryInterface;
use App\Modules\Curriculum\Repositories\Contracts\ModuleRepositoryInterface;
use App\Modules\Enrollment\Repositories\Contracts\EnrollmentRepositoryInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;

class CurriculumService
{
    public function __construct(
        private readonly ModuleRepositoryInterface $moduleRepository,
        private readonly LessonProgressRepositoryInterface $progressRepository,
        private readonly CourseRepositoryInterface $courseRepository,
        private readonly EnrollmentRepositoryInterface $enrollmentRepository,
    ) {}

    public function listModules(User $user, string $courseId): Collection
    {
        $course = $this->findCourseOrFail($courseId);
        $this->assertCanView($user, $course);

        $modules = $this->moduleRepository->listForCourse($courseId);
        $lessonIds = $modules->flatMap(fn (Module $module) => $module->lessons)->pluck('id')->all();
        $progressByLesson = $this->progressRepository->mapForUserAndLessons($user->id, $lessonIds);

        $modules->each(function (Module $module) use ($progressByLesson) {
            $module->lessons->each(function ($lesson) use ($progressByLesson) {
                $lesson->progressForUser = $progressByLesson->get($lesson->id);
            });
        });

        return $modules;
    }

    public function createModule(User $teacher, string $courseId, array $data): Module
    {
        $course = $this->findCourseOrFail($courseId);
        $this->assertIsInstructor($teacher, $course);

        return $this->moduleRepository->create([
            'course_id'  => $courseId,
            'title'      => $data['title'],
            'sort_order' => $data['sort_order'] ?? $this->moduleRepository->nextSortOrder($courseId),
        ])->load('lessons');
    }

    public function updateModule(User $teacher, string $moduleId, array $data): Module
    {
        $module = $this->findModuleOrFail($moduleId);
        $this->assertIsInstructor($teacher, $module->course);

        return $this->moduleRepository->update($module, $data);
    }

    public function deleteModule(User $teacher, string $moduleId): void
    {
        $module = $this->findModuleOrFail($moduleId);
        $this->assertIsInstructor($teacher, $module->course);

        $this->moduleRepository->delete($module);
    }

    private function findCourseOrFail(string $courseId): Course
    {
        $course = $this->courseRepository->find($courseId);

        if (! $course) {
            throw new ModelNotFoundException('Course not found.');
        }

        return $course;
    }

    private function findModuleOrFail(string $moduleId): Module
    {
        $module = $this->moduleRepository->find($moduleId);

        if (! $module) {
            throw new ModelNotFoundException('Module not found.');
        }

        return $module;
    }

    private function assertCanView(User $user, Course $course): void
    {
        if ($user->hasRole('teacher') && $course->instructor_id === $user->id) {
            return;
        }

        if ($this->enrollmentRepository->isEnrolled($user, $course->id)) {
            return;
        }

        throw new AuthorizationException('You do not have access to this course.');
    }

    private function assertIsInstructor(User $teacher, Course $course): void
    {
        if ($course->instructor_id !== $teacher->id) {
            throw new AuthorizationException('You do not have access to this course.');
        }
    }
}
