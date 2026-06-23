<?php

namespace App\Modules\Analytics\Services;

use App\Models\User;
use App\Modules\Analytics\Repositories\Contracts\AnalyticsRepositoryInterface;
use App\Modules\Assessment\Repositories\Contracts\AttemptRepositoryInterface;

class DashboardService
{
    public function __construct(
        private readonly AnalyticsRepositoryInterface $analyticsRepository,
        private readonly AttemptRepositoryInterface $attemptRepository,
    ) {}

    /** @return array<string, mixed> */
    public function forTeacher(User $teacher): array
    {
        $stats = $this->analyticsRepository->dashboardStats($teacher);

        return [
            'stats'         => [
                'active_students'        => $stats['active_students'],
                'courses_count'          => $stats['courses_count'],
                'awaiting_grading'       => $stats['awaiting_grading'],
                'avg_class_score'        => $stats['avg_class_score'],
                'avg_class_score_change' => $stats['avg_class_score_change'],
                'at_risk_students'       => $stats['at_risk_students'],
            ],
            'grading_queue' => $this->attemptRepository->gradingQueueForTeacher($teacher),
        ];
    }
}
