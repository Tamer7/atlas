<?php

namespace App\Modules\Course;

use App\Modules\Course\Repositories\Contracts\CourseRepositoryInterface;
use App\Modules\Course\Repositories\CourseRepository;
use Illuminate\Support\ServiceProvider;

class CourseServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(CourseRepositoryInterface::class, CourseRepository::class);
    }
}
