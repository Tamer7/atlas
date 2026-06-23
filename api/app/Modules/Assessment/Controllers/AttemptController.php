<?php

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Requests\SaveAnswersRequest;
use App\Modules\Assessment\Resources\AttemptResource;
use App\Modules\Assessment\Services\AttemptService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class AttemptController extends Controller
{
    public function __construct(private readonly AttemptService $attemptService) {}

    public function start(string $quizId): JsonResponse
    {
        try {
            $attempt = $this->attemptService->start(request()->user(), $quizId);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Quiz not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data'    => new AttemptResource($attempt),
            'message' => 'Attempt started.',
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        try {
            $attempt = $this->attemptService->show(request()->user(), $id);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Attempt not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        $showCorrect = request()->user()->hasRole('teacher')
            || ($attempt->quiz->show_correct && $attempt->status === 'graded');

        return response()->json([
            'data' => new AttemptResource($attempt, $showCorrect),
        ]);
    }

    public function saveAnswers(SaveAnswersRequest $request, string $id): JsonResponse
    {
        try {
            $attempt = $this->attemptService->saveAnswers(
                $request->user(),
                $id,
                $request->validated()['answers'],
            );
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Attempt not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data'    => new AttemptResource($attempt),
            'message' => 'Answers saved.',
        ]);
    }

    public function submit(string $id): JsonResponse
    {
        try {
            $attempt = $this->attemptService->submit(request()->user(), $id);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Attempt not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data'    => new AttemptResource($attempt),
            'message' => 'Attempt submitted.',
        ]);
    }

    public function results(string $id): JsonResponse
    {
        try {
            $attempt = $this->attemptService->results(request()->user(), $id);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Attempt not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        $showCorrect = request()->user()->hasRole('teacher') || $attempt->quiz->show_correct;

        return response()->json([
            'data' => new AttemptResource($attempt, $showCorrect),
        ]);
    }
}
