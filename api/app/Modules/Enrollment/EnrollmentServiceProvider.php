<?php

namespace App\Modules\Enrollment;

use App\Modules\Enrollment\Repositories\Contracts\InvitationRepositoryInterface;
use App\Modules\Enrollment\Repositories\InvitationRepository;
use Illuminate\Support\ServiceProvider;

class EnrollmentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(InvitationRepositoryInterface::class, InvitationRepository::class);
    }

    public function boot(): void
    {
        $this->loadViewsFrom(resource_path('views/enrollment'), 'enrollment');
    }
}
