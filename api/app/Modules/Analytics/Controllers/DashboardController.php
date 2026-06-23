<?php

namespace App\Modules\Analytics\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Analytics\Resources\DashboardResource;
use App\Modules\Analytics\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService) {}

    public function index(): JsonResponse
    {
        $dashboard = $this->dashboardService->forTeacher(request()->user());

        return response()->json([
            'data' => new DashboardResource($dashboard),
        ]);
    }
}
