<?php

namespace App\Modules\Enrollment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Enrollment\Requests\AddStudentRequest;
use App\Modules\Enrollment\Resources\TeacherStudentResource;
use App\Modules\Enrollment\Services\TeacherStudentService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class TeacherStudentController extends Controller
{
    public function __construct(private readonly TeacherStudentService $teacherStudentService) {}

    public function index(): JsonResponse
    {
        $students = $this->teacherStudentService->listForTeacher(request()->user());

        return response()->json([
            'data' => TeacherStudentResource::collection($students),
        ]);
    }

    public function courseStudents(string $courseId): JsonResponse
    {
        try {
            $students = $this->teacherStudentService->listForCourse(request()->user(), $courseId);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data' => TeacherStudentResource::collection($students),
        ]);
    }

    public function store(AddStudentRequest $request, string $courseId): JsonResponse
    {
        try {
            $student = $this->teacherStudentService->addToCourse(
                $request->user(),
                $courseId,
                $request->validated('email'),
            );
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data'    => new TeacherStudentResource($student),
            'message' => 'Student enrolled.',
        ], 201);
    }

    public function destroy(string $courseId, string $userId): JsonResponse
    {
        try {
            $this->teacherStudentService->removeFromCourse(request()->user(), $courseId, $userId);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json(['message' => 'Student removed from course.']);
    }
}
