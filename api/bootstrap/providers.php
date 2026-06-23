<?php

use App\Providers\AppServiceProvider;
use App\Modules\Auth\AuthServiceProvider;
use App\Modules\Assessment\AssessmentServiceProvider;
use App\Modules\Course\CourseServiceProvider;
use App\Modules\Curriculum\CurriculumServiceProvider;
use App\Modules\Analytics\AnalyticsServiceProvider;
use App\Modules\Enrollment\EnrollmentServiceProvider;

return [
    AppServiceProvider::class,
    AuthServiceProvider::class,
    AnalyticsServiceProvider::class,
    AssessmentServiceProvider::class,
    CourseServiceProvider::class,
    CurriculumServiceProvider::class,
    EnrollmentServiceProvider::class,
];
