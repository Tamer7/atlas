<?php

namespace App\Modules\Analytics\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Analytics\Resources\ReportsResource;
use App\Modules\Analytics\Services\ReportsService;
use Illuminate\Http\JsonResponse;

class ReportsController extends Controller
{
    public function __construct(private readonly ReportsService $reportsService) {}

    public function index(): JsonResponse
    {
        $reports = $this->reportsService->forTeacher(request()->user());

        return response()->json([
            'data' => new ReportsResource($reports),
        ]);
    }
}
