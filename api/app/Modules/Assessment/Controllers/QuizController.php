<?php

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Requests\CreateQuizRequest;
use App\Modules\Assessment\Requests\UpdateQuizRequest;
use App\Modules\Assessment\Resources\QuizListResource;
use App\Modules\Assessment\Resources\QuizResource;
use App\Modules\Assessment\Services\QuizService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class QuizController extends Controller
{
    public function __construct(private readonly QuizService $quizService) {}

    public function teacherIndex(): JsonResponse
    {
        try {
            $quizzes = $this->quizService->listForTeacher(request()->user());
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data' => QuizListResource::collection($quizzes),
        ]);
    }

    public function index(string $courseId): JsonResponse
    {
        try {
            $quizzes = $this->quizService->listForCourse(request()->user(), $courseId);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Course not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        $includeAnswers = request()->user()->hasRole('teacher');

        return response()->json([
            'data' => $quizzes->map(fn ($quiz) => new QuizResource($quiz, $includeAnswers)),
        ]);
    }

    public function store(CreateQuizRequest $request, string $courseId): JsonResponse
    {
        try {
            $quiz = $this->quizService->create($request->user(), $courseId, $request->validated());
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Course not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 422);
        }

        return response()->json([
            'data'    => new QuizResource($quiz, true),
            'message' => 'Quiz created.',
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        try {
            $quiz = $this->quizService->show(request()->user(), $id);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Quiz not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        $includeAnswers = $this->quizService->canSeeAnswers(request()->user(), $quiz);

        return response()->json([
            'data' => new QuizResource($quiz, $includeAnswers),
        ]);
    }

    public function update(UpdateQuizRequest $request, string $id): JsonResponse
    {
        try {
            $quiz = $this->quizService->update($request->user(), $id, $request->validated());
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Quiz not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 422);
        }

        return response()->json([
            'data'    => new QuizResource($quiz, true),
            'message' => 'Quiz updated.',
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $this->quizService->delete(request()->user(), $id);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Quiz not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json(['message' => 'Quiz deleted.']);
    }
}
