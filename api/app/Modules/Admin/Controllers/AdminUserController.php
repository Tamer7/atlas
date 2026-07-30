<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Admin\Exceptions\AdminActionDenied;
use App\Modules\Admin\Requests\CreateUserRequest;
use App\Modules\Admin\Requests\UpdateUserRequest;
use App\Modules\Admin\Resources\AdminUserDetailResource;
use App\Modules\Admin\Resources\AdminUserResource;
use App\Modules\Admin\Services\AdminUserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminUserController extends Controller
{
    public function __construct(private readonly AdminUserService $users) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $paginator = $this->users->list([
            'search' => $request->query('search'),
            'role'   => $request->query('role'),
            'status' => $request->query('status'),
        ], (int) $request->query('per_page', 25));

        return AdminUserResource::collection($paginator);
    }

    public function store(CreateUserRequest $request): JsonResponse
    {
        $user = $this->users->create($request->user(), $request->validated());

        return response()->json([
            'data'    => $user ? new AdminUserResource($user) : null,
            'message' => $user ? 'User created.' : 'Invitation sent.',
        ], 201);
    }

    public function update(UpdateUserRequest $request, string $id): JsonResponse
    {
        try {
            $user = $this->users->update($request->user(), $id, $request->validated());
        } catch (AdminActionDenied $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => new AdminUserResource($user)]);
    }

    public function deactivate(Request $request, string $id): JsonResponse
    {
        try {
            $user = $this->users->deactivate($request->user(), $id);
        } catch (AdminActionDenied $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => new AdminUserResource($user)]);
    }

    public function reactivate(string $id): JsonResponse
    {
        return response()->json([
            'data' => new AdminUserResource($this->users->reactivate($id)),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        return response()->json([
            'data' => new AdminUserDetailResource($this->users->detail($id)),
        ]);
    }

    public function passwordReset(string $id): JsonResponse
    {
        try {
            $this->users->sendPasswordReset($id);
        } catch (AdminActionDenied $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'Password reset link sent.']);
    }
}
