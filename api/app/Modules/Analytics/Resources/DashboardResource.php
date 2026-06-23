<?php

namespace App\Modules\Analytics\Resources;

use App\Modules\Assessment\Resources\GradingQueueResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'stats'         => new DashboardStatsResource($this->resource['stats']),
            'grading_queue' => GradingQueueResource::collection($this->resource['grading_queue']),
        ];
    }
}
