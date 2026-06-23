<?php

namespace App\Modules\Analytics\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->resource['id'],
            'title'           => $this->resource['title'],
            'students_count'  => $this->resource['students_count'],
            'avg_score'       => $this->resource['avg_score'],
            'avg_attendance'  => $this->resource['avg_attendance'],
            'completion_pct'  => $this->resource['completion_pct'],
            'at_risk_count'   => $this->resource['at_risk_count'],
            'quiz_count'      => $this->resource['quiz_count'],
        ];
    }
}
