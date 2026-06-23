<?php

namespace App\Modules\Curriculum\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Curriculum\Requests\CreateModuleRequest;
use App\Modules\Curriculum\Requests\UpdateModuleRequest;
use App\Modules\Curriculum\Resources\ModuleResource;
use App\Modules\Curriculum\Services\CurriculumService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class ModuleController extends Controller
{
    public function __construct(private readonly CurriculumService $curriculumService) {}

    public function index(string $courseId): JsonResponse
    {
        try {
            $modules = $this->curriculumService->listModules(request()->user(), $courseId);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Course not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data' => ModuleResource::collection($modules),
        ]);
    }

    public function store(CreateModuleRequest $request, string $courseId): JsonResponse
    {
        try {
            $module = $this->curriculumService->createModule(
                $request->user(),
                $courseId,
                $request->validated(),
            );
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Course not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data'    => new ModuleResource($module),
            'message' => 'Module created.',
        ], 201);
    }

    public function update(UpdateModuleRequest $request, string $id): JsonResponse
    {
        try {
            $module = $this->curriculumService->updateModule(
                $request->user(),
                $id,
                $request->validated(),
            );
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Module not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data'    => new ModuleResource($module),
            'message' => 'Module updated.',
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $this->curriculumService->deleteModule(request()->user(), $id);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Module not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json(['message' => 'Module deleted.']);
    }
}
