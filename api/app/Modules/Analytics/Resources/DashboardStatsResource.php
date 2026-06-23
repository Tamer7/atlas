<?php

namespace App\Modules\Analytics\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardStatsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'active_students'        => $this->resource['active_students'],
            'courses_count'          => $this->resource['courses_count'],
            'awaiting_grading'       => $this->resource['awaiting_grading'],
            'avg_class_score'        => $this->resource['avg_class_score'],
            'avg_class_score_change' => $this->resource['avg_class_score_change'],
            'at_risk_students'       => $this->resource['at_risk_students'],
        ];
    }
}
