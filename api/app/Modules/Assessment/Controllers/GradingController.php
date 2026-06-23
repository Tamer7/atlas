<?php

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Requests\CompleteGradingRequest;
use App\Modules\Assessment\Requests\GradeAnswerRequest;
use App\Modules\Assessment\Resources\AttemptResource;
use App\Modules\Assessment\Resources\GradingQueueResource;
use App\Modules\Assessment\Services\GradingService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class GradingController extends Controller
{
    public function __construct(private readonly GradingService $gradingService) {}

    public function index(): JsonResponse
    {
        $queue = $this->gradingService->queue(request()->user());

        return response()->json([
            'data' => GradingQueueResource::collection($queue),
        ]);
    }

    public function gradeAnswer(GradeAnswerRequest $request, string $attemptId, string $answerId): JsonResponse
    {
        try {
            $attempt = $this->gradingService->gradeAnswer(
                $request->user(),
                $attemptId,
                $answerId,
                $request->validated()['score'],
                $request->validated()['feedback'] ?? null,
            );
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 422);
        }

        return response()->json([
            'data'    => new AttemptResource($attempt, true),
            'message' => 'Answer graded.',
        ]);
    }

    public function complete(CompleteGradingRequest $request, string $attemptId): JsonResponse
    {
        try {
            $attempt = $this->gradingService->complete(
                $request->user(),
                $attemptId,
                $request->validated()['overall_feedback'] ?? null,
            );
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Attempt not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data'    => new AttemptResource($attempt, true),
            'message' => 'Grading completed.',
        ]);
    }
}
