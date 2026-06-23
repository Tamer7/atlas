<?php

namespace App\Modules\Analytics\Services;

use App\Models\User;
use App\Modules\Analytics\Repositories\Contracts\AnalyticsRepositoryInterface;

class ReportsService
{
    public function __construct(
        private readonly AnalyticsRepositoryInterface $analyticsRepository,
    ) {}

    /** @return array<string, mixed> */
    public function forTeacher(User $teacher): array
    {
        return $this->analyticsRepository->reports($teacher);
    }
}
