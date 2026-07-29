<?php

namespace App\Modules\Profile\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Profile\Resources\DueAssignmentResource;
use App\Modules\Profile\Resources\GradeResource;
use App\Modules\Profile\Resources\StudentCommentResource;
use App\Modules\Profile\Services\StudentProfileService;
use Illuminate\Http\JsonResponse;

class StudentProfileController extends Controller
{
    public function __construct(private readonly StudentProfileService $profileService) {}

    public function grades(): JsonResponse
    {
        $grades = $this->profileService->grades(request()->user());

        return response()->json([
            'data' => GradeResource::collection($grades),
        ]);
    }

    public function dueAssignments(): JsonResponse
    {
        $assignments = $this->profileService->dueAssignments(request()->user());

        return response()->json([
            'data' => DueAssignmentResource::collection($assignments),
        ]);
    }

    public function comments(): JsonResponse
    {
        $comments = $this->profileService->commentsAboutStudent(request()->user());

        return response()->json([
            'data' => StudentCommentResource::collection($comments),
        ]);
    }
}
