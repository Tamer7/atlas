<?php

namespace App\Modules\Curriculum\Services;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Module;
use App\Models\User;
use App\Modules\Curriculum\Repositories\Contracts\LessonProgressRepositoryInterface;
use App\Modules\Curriculum\Repositories\Contracts\LessonRepositoryInterface;
use App\Modules\Curriculum\Repositories\Contracts\ModuleRepositoryInterface;
use App\Modules\Enrollment\Repositories\Contracts\EnrollmentRepositoryInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class LessonService
{
    public function __construct(
        private readonly LessonRepositoryInterface $lessonRepository,
        private readonly ModuleRepositoryInterface $moduleRepository,
        private readonly LessonProgressRepositoryInterface $progressRepository,
        private readonly EnrollmentRepositoryInterface $enrollmentRepository,
    ) {}

    public function createLesson(User $teacher, string $moduleId, array $data): Lesson
    {
        $module = $this->findModuleOrFail($moduleId);
        $this->assertIsInstructor($teacher, $module->course);

        return $this->lessonRepository->create([
            'module_id'        => $moduleId,
            'title'            => $data['title'],
            'number'           => $data['number'] ?? $this->lessonRepository->nextNumber($moduleId),
            'duration_seconds' => $data['duration_seconds'] ?? null,
            'sort_order'       => $data['sort_order'] ?? $this->lessonRepository->nextSortOrder($moduleId),
            'content_type'     => $data['content_type'] ?? 'text',
            'body'             => $data['body'] ?? null,
            'video_url'        => $data['video_url'] ?? null,
            'chapters'         => $data['chapters'] ?? null,
            'transcript'       => $data['transcript'] ?? null,
            'attachments'      => $data['attachments'] ?? null,
            'quiz_id'          => $data['quiz_id'] ?? null,
        ])->load('module.course');
    }

    public function showLesson(User $user, string $lessonId): Lesson
    {
        $lesson = $this->findLessonOrFail($lessonId);
        $this->assertCanView($user, $lesson->module->course);

        return $lesson;
    }

    public function updateLesson(User $teacher, string $lessonId, array $data): Lesson
    {
        $lesson = $this->findLessonOrFail($lessonId);
        $this->assertIsInstructor($teacher, $lesson->module->course);

        return $this->lessonRepository->update($lesson, $data);
    }

    public function uploadVideo(User $teacher, string $lessonId, UploadedFile $file): Lesson
    {
        $lesson = $this->findLessonOrFail($lessonId);
        $this->assertIsInstructor($teacher, $lesson->module->course);

        $disk = Storage::disk('s3');
        $path = "lesson-videos/{$lesson->id}/".Str::uuid().'.'.$file->getClientOriginalExtension();

        if ($disk->putFileAs(dirname($path), $file, basename($path)) === false) {
            throw new RuntimeException('Failed to store the video file.');
        }

        $this->deleteStoredVideo($lesson->video_url);

        return $this->lessonRepository->update($lesson, [
            'content_type' => 'video',
            'video_url'    => $disk->url($path),
        ]);
    }

    private function deleteStoredVideo(?string $videoUrl): void
    {
        $baseUrl = config('filesystems.disks.s3.url');

        if (! $videoUrl || ! $baseUrl || ! str_starts_with($videoUrl, $baseUrl)) {
            return;
        }

        Storage::disk('s3')->delete(ltrim(substr($videoUrl, strlen($baseUrl)), '/'));
    }

    public function deleteLesson(User $teacher, string $lessonId): void
    {
        $lesson = $this->findLessonOrFail($lessonId);
        $this->assertIsInstructor($teacher, $lesson->module->course);

        $this->lessonRepository->delete($lesson);
    }

    public function updateProgress(User $student, string $lessonId, array $data): LessonProgress
    {
        $lesson = $this->findLessonOrFail($lessonId);
        $this->assertIsEnrolledStudent($student, $lesson->module->course);

        $progressData = [];

        if (array_key_exists('position_seconds', $data)) {
            $progressData['position_seconds'] = $data['position_seconds'];
        }

        if (! empty($data['completed'])) {
            $progressData['completed_at'] = now();
        }

        return $this->progressRepository->upsert($student->id, $lessonId, $progressData);
    }

    public function updateNotes(User $student, string $lessonId, string $notes): LessonProgress
    {
        $lesson = $this->findLessonOrFail($lessonId);
        $this->assertIsEnrolledStudent($student, $lesson->module->course);

        return $this->progressRepository->updateNotes($student->id, $lessonId, $notes);
    }

    public function progressForUser(User $user, string $lessonId): ?LessonProgress
    {
        return $this->progressRepository->findForUser($user->id, $lessonId);
    }

    private function findModuleOrFail(string $moduleId): Module
    {
        $module = $this->moduleRepository->find($moduleId);

        if (! $module) {
            throw new ModelNotFoundException('Module not found.');
        }

        return $module;
    }

    private function findLessonOrFail(string $lessonId): Lesson
    {
        $lesson = $this->lessonRepository->find($lessonId);

        if (! $lesson) {
            throw new ModelNotFoundException('Lesson not found.');
        }

        return $lesson;
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

    private function assertIsEnrolledStudent(User $student, Course $course): void
    {
        if (! $student->hasRole('student')) {
            throw new AuthorizationException('Only students can perform this action.');
        }

        if (! $this->enrollmentRepository->isEnrolled($student, $course->id)) {
            throw new AuthorizationException('You do not have access to this course.');
        }
    }
}
