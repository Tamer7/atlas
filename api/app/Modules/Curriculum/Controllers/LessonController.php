<?php

namespace App\Modules\Curriculum\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Curriculum\Requests\CreateLessonRequest;
use App\Modules\Curriculum\Requests\UpdateLessonNotesRequest;
use App\Modules\Curriculum\Requests\UpdateLessonProgressRequest;
use App\Modules\Curriculum\Requests\UpdateLessonRequest;
use App\Modules\Curriculum\Requests\UploadLessonVideoRequest;
use App\Modules\Curriculum\Resources\LessonDetailResource;
use App\Modules\Curriculum\Services\LessonService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class LessonController extends Controller
{
    public function __construct(private readonly LessonService $lessonService) {}

    public function store(CreateLessonRequest $request, string $moduleId): JsonResponse
    {
        try {
            $lesson = $this->lessonService->createLesson(
                $request->user(),
                $moduleId,
                $request->validated(),
            );
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Module not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data'    => new LessonDetailResource($lesson),
            'message' => 'Lesson created.',
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        try {
            $lesson = $this->lessonService->showLesson(request()->user(), $id);
            $lesson->progressForUser = $this->lessonService->progressForUser(request()->user(), $id);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Lesson not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data' => new LessonDetailResource($lesson),
        ]);
    }

    public function update(UpdateLessonRequest $request, string $id): JsonResponse
    {
        try {
            $lesson = $this->lessonService->updateLesson(
                $request->user(),
                $id,
                $request->validated(),
            );
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Lesson not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data'    => new LessonDetailResource($lesson),
            'message' => 'Lesson updated.',
        ]);
    }

    public function uploadVideo(UploadLessonVideoRequest $request, string $id): JsonResponse
    {
        try {
            $lesson = $this->lessonService->uploadVideo(
                $request->user(),
                $id,
                $request->file('video'),
            );
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Lesson not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 500);
        }

        return response()->json([
            'data'    => new LessonDetailResource($lesson),
            'message' => 'Video uploaded.',
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $this->lessonService->deleteLesson(request()->user(), $id);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Lesson not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json(['message' => 'Lesson deleted.']);
    }

    public function updateProgress(UpdateLessonProgressRequest $request, string $id): JsonResponse
    {
        try {
            $progress = $this->lessonService->updateProgress(
                $request->user(),
                $id,
                $request->validated(),
            );
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Lesson not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data'    => [
                'position_seconds' => $progress->position_seconds,
                'completed_at'     => $progress->completed_at?->toJSON(),
            ],
            'message' => 'Progress updated.',
        ]);
    }

    public function updateNotes(UpdateLessonNotesRequest $request, string $id): JsonResponse
    {
        try {
            $progress = $this->lessonService->updateNotes(
                $request->user(),
                $id,
                $request->validated('notes'),
            );
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Lesson not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data'    => ['notes' => $progress->notes],
            'message' => 'Notes updated.',
        ]);
    }
}
