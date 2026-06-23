<?php

namespace App\Modules\Analytics\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'summary' => new ReportsSummaryResource($this->resource['summary']),
            'courses' => CourseReportResource::collection($this->resource['courses']),
        ];
    }
}
