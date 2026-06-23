<?php

use App\Providers\AppServiceProvider;
use App\Modules\Auth\AuthServiceProvider;
use App\Modules\Course\CourseServiceProvider;
use App\Modules\Enrollment\EnrollmentServiceProvider;

return [
    AppServiceProvider::class,
    AuthServiceProvider::class,
    CourseServiceProvider::class,
    EnrollmentServiceProvider::class,
];
