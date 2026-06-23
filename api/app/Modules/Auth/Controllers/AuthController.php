<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Requests\LoginRequest;
use App\Modules\Auth\Requests\MagicLinkRequest;
use App\Modules\Auth\Requests\RegisterRequest;
use App\Modules\Auth\Resources\UserResource;
use App\Modules\Auth\Services\AuthService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $user = $this->authService->login($request->validated());
        } catch (AuthenticationException) {
            return response()->json(['message' => 'Invalid credentials.', 'errors' => []], 401);
        }

        return response()->json([
            'data'    => ['user' => new UserResource($user)],
            'message' => 'Logged in successfully.',
        ]);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());

        return response()->json([
            'data'    => ['user' => new UserResource($user)],
            'message' => 'Account created successfully.',
        ], 201);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request);

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => ['user' => new UserResource($request->user())],
        ]);
    }

    public function sendMagicLink(MagicLinkRequest $request): JsonResponse
    {
        $this->authService->sendMagicLink($request->validated('email'));

        return response()->json(['message' => 'Sign-in link sent.']);
    }

    public function verifyMagicLink(Request $request): JsonResponse
    {
        $request->validate(['token' => ['required', 'string']]);

        try {
            $user = $this->authService->verifyMagicLink($request->query('token'));
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 422);
        }

        return response()->json([
            'data'    => ['user' => new UserResource($user)],
            'message' => 'Signed in successfully.',
        ]);
    }
}
