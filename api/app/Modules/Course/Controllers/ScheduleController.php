<?php

namespace App\Modules\Course\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Course\Requests\CreateScheduleSlotRequest;
use App\Modules\Course\Requests\UpdateScheduleSlotRequest;
use App\Modules\Course\Resources\ScheduleSlotResource;
use App\Modules\Course\Services\ScheduleService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class ScheduleController extends Controller
{
    public function __construct(private readonly ScheduleService $scheduleService) {}

    public function index(string $courseId): JsonResponse
    {
        try {
            $slots = $this->scheduleService->listForCourse(request()->user(), $courseId);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data' => ScheduleSlotResource::collection($slots),
        ]);
    }

    public function mySchedule(): JsonResponse
    {
        $slots = $this->scheduleService->listForUser(request()->user());

        return response()->json([
            'data' => ScheduleSlotResource::collection($slots),
        ]);
    }

    public function store(CreateScheduleSlotRequest $request, string $courseId): JsonResponse
    {
        try {
            $slot = $this->scheduleService->createSlot($request->user(), $courseId, $request->validated());
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data'    => new ScheduleSlotResource($slot),
            'message' => 'Schedule slot created.',
        ], 201);
    }

    public function update(UpdateScheduleSlotRequest $request, string $id): JsonResponse
    {
        try {
            $slot = $this->scheduleService->updateSlot($request->user(), $id, $request->validated());
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data'    => new ScheduleSlotResource($slot),
            'message' => 'Schedule slot updated.',
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $this->scheduleService->deleteSlot(request()->user(), $id);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json(['message' => 'Schedule slot deleted.']);
    }
}
