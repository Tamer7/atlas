<?php

namespace App\Modules\Profile\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Profile\Requests\CreateStudentCommentRequest;
use App\Modules\Profile\Requests\UpdateStudentCommentRequest;
use App\Modules\Profile\Resources\StudentCommentResource;
use App\Modules\Profile\Services\StudentCommentService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class StudentCommentController extends Controller
{
    public function __construct(private readonly StudentCommentService $commentService) {}

    public function index(string $studentId): JsonResponse
    {
        try {
            $comments = $this->commentService->listForStudent(request()->user(), $studentId);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data' => StudentCommentResource::collection($comments),
        ]);
    }

    public function store(CreateStudentCommentRequest $request, string $studentId): JsonResponse
    {
        try {
            $comment = $this->commentService->create($request->user(), $studentId, $request->validated());
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data'    => new StudentCommentResource($comment),
            'message' => 'Comment added.',
        ], 201);
    }

    public function update(UpdateStudentCommentRequest $request, string $id): JsonResponse
    {
        try {
            $comment = $this->commentService->update($request->user(), $id, $request->validated());
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data'    => new StudentCommentResource($comment),
            'message' => 'Comment updated.',
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $this->commentService->delete(request()->user(), $id);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json(['message' => 'Comment deleted.']);
    }
}
