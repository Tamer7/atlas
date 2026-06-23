<?php

namespace App\Modules\Enrollment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Resources\UserResource;
use App\Modules\Enrollment\Requests\InviteStudentRequest;
use App\Modules\Enrollment\Services\InvitationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvitationController extends Controller
{
    public function __construct(private readonly InvitationService $invitationService) {}

    public function store(InviteStudentRequest $request): JsonResponse
    {
        $this->invitationService->invite(
            $request->user(),
            $request->validated('email'),
            $request->validated('course_ids'),
        );

        return response()->json(['message' => 'Invitation sent.']);
    }

    public function accept(Request $request): JsonResponse
    {
        $request->validate(['token' => ['required', 'string']]);

        try {
            $user = $this->invitationService->accept($request->query('token'));
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 422);
        }

        return response()->json([
            'data'    => ['user' => new UserResource($user)],
            'message' => 'Welcome to Atlas.',
        ]);
    }
}
