<?php

namespace App\Modules\Live\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Live\Requests\CreateLiveClassRequest;
use App\Modules\Live\Resources\LiveClassResource;
use App\Modules\Live\Services\LiveService;
use App\Modules\Live\Repositories\Contracts\LiveClassRepositoryInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;

class LiveClassController extends Controller
{
    public function __construct(
        private readonly LiveService $liveService,
        private readonly LiveClassRepositoryInterface $repo,
    ) {}

    public function index(string $courseId): JsonResponse
    {
        $classes = $this->repo->listForCourse($courseId);

        return response()->json([
            'data' => LiveClassResource::collection($classes),
        ]);
    }

    public function teacherIndex(): JsonResponse
    {
        $classes = $this->repo->listForTeacher(request()->user());

        return response()->json([
            'data' => LiveClassResource::collection($classes),
        ]);
    }

    public function studentIndex(): JsonResponse
    {
        $classes = $this->repo->listForStudent(request()->user());

        return response()->json([
            'data' => LiveClassResource::collection($classes),
        ]);
    }

    public function store(CreateLiveClassRequest $request): JsonResponse
    {
        $class = $this->liveService->create($request->validated(), $request->user());

        return response()->json([
            'data'    => new LiveClassResource($class),
            'message' => 'Live class scheduled.',
        ], 201);
    }

    public function token(string $id): JsonResponse
    {
        $class = $this->repo->find($id);

        if (! $class) {
            return response()->json(['message' => 'Live class not found.'], 404);
        }

        try {
            ['token' => $token, 'role' => $role] = $this->liveService->generateToken($class, request()->user());
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }

        return response()->json([
            'data' => [
                'token'      => $token,
                'role'       => $role,
                'server_url' => config('services.livekit.url'),
                'room_name'  => $class->room_name,
                'title'      => $class->title,
            ],
        ]);
    }

    public function start(string $id): JsonResponse
    {
        $class = $this->repo->find($id);

        if (! $class) {
            return response()->json(['message' => 'Live class not found.'], 404);
        }

        try {
            $class = $this->liveService->start($class, request()->user());
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }

        return response()->json([
            'data'    => new LiveClassResource($class),
            'message' => 'Class started.',
        ]);
    }

    public function end(string $id): JsonResponse
    {
        $class = $this->repo->find($id);

        if (! $class) {
            return response()->json(['message' => 'Live class not found.'], 404);
        }

        try {
            $class = $this->liveService->end($class, request()->user());
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }

        return response()->json([
            'data'    => new LiveClassResource($class),
            'message' => 'Class ended.',
        ]);
    }
}
