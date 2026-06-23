<?php

namespace App\Modules\Course\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Course\Requests\CreateCourseRequest;
use App\Modules\Course\Requests\UpdateCourseRequest;
use App\Modules\Course\Resources\CourseDetailResource;
use App\Modules\Course\Resources\CourseResource;
use App\Modules\Course\Services\CourseService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class CourseController extends Controller
{
    public function __construct(private readonly CourseService $courseService) {}

    public function index(): JsonResponse
    {
        $courses = $this->courseService->list(request()->user());

        return response()->json([
            'data' => CourseResource::collection($courses),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        try {
            $course = $this->courseService->show(request()->user(), $id);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Course not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data' => new CourseDetailResource($course),
        ]);
    }

    public function store(CreateCourseRequest $request): JsonResponse
    {
        $course = $this->courseService->create($request->user(), $request->validated());

        return response()->json([
            'data'    => new CourseResource($course),
            'message' => 'Course created.',
        ], 201);
    }

    public function update(UpdateCourseRequest $request, string $id): JsonResponse
    {
        try {
            $course = $this->courseService->update($request->user(), $id, $request->validated());
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Course not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data'    => new CourseResource($course),
            'message' => 'Course updated.',
        ]);
    }
}
