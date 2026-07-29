<?php

namespace App\Modules\Profile;

use App\Modules\Profile\Repositories\Contracts\StudentCommentRepositoryInterface;
use App\Modules\Profile\Repositories\Contracts\StudentRecordRepositoryInterface;
use App\Modules\Profile\Repositories\StudentCommentRepository;
use App\Modules\Profile\Repositories\StudentRecordRepository;
use Illuminate\Support\ServiceProvider;

class ProfileServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(StudentCommentRepositoryInterface::class, StudentCommentRepository::class);
        $this->app->bind(StudentRecordRepositoryInterface::class, StudentRecordRepository::class);
    }
}
