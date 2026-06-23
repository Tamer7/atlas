<?php

namespace App\Modules\Analytics\Repositories\Contracts;

use App\Models\User;
use Illuminate\Support\Collection;

interface AnalyticsRepositoryInterface
{
    /** @return array<string, mixed> */
    public function dashboardStats(User $teacher): array;

    /** @return array<string, mixed> */
    public function reports(User $teacher): array;

    /** @param Collection<int, User> $students */
    public function enrichStudentsWithMetrics(Collection $students, User $teacher, ?string $courseId = null): Collection;
}
