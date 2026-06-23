<?php

namespace App\Modules\Analytics\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportsSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'total_students'   => $this->resource['total_students'],
            'avg_score'        => $this->resource['avg_score'],
            'avg_attendance'   => $this->resource['avg_attendance'],
            'at_risk_students' => $this->resource['at_risk_students'],
        ];
    }
}
