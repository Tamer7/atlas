<?php

namespace App\Modules\Course;

use App\Modules\Course\Repositories\Contracts\CourseRepositoryInterface;
use App\Modules\Course\Repositories\Contracts\ScheduleRepositoryInterface;
use App\Modules\Course\Repositories\CourseRepository;
use App\Modules\Course\Repositories\ScheduleRepository;
use Illuminate\Support\ServiceProvider;

class CourseServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(CourseRepositoryInterface::class, CourseRepository::class);
        $this->app->bind(ScheduleRepositoryInterface::class, ScheduleRepository::class);
    }
}
