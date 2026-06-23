<?php

namespace App\Modules\Curriculum\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Curriculum\Requests\CreateDiscussionPostRequest;
use App\Modules\Curriculum\Resources\DiscussionPostResource;
use App\Modules\Curriculum\Services\DiscussionService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class DiscussionController extends Controller
{
    public function __construct(private readonly DiscussionService $discussionService) {}

    public function index(string $id): JsonResponse
    {
        try {
            $posts = $this->discussionService->listPosts(request()->user(), $id);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Lesson not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data' => DiscussionPostResource::collection($posts),
        ]);
    }

    public function store(CreateDiscussionPostRequest $request, string $id): JsonResponse
    {
        try {
            $post = $this->discussionService->createPost(
                $request->user(),
                $id,
                $request->validated(),
            );
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Lesson not found.', 'errors' => []], 404);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => []], 403);
        }

        return response()->json([
            'data'    => new DiscussionPostResource($post),
            'message' => 'Post created.',
        ], 201);
    }
}
