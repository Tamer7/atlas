<?php

use App\Providers\AppServiceProvider;
use App\Modules\Auth\AuthServiceProvider;
use App\Modules\Enrollment\EnrollmentServiceProvider;

return [
    AppServiceProvider::class,
    AuthServiceProvider::class,
    EnrollmentServiceProvider::class,
];
