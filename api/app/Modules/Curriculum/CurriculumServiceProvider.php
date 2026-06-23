<?php

namespace App\Modules\Curriculum;

use App\Modules\Curriculum\Repositories\Contracts\DiscussionRepositoryInterface;
use App\Modules\Curriculum\Repositories\Contracts\LessonProgressRepositoryInterface;
use App\Modules\Curriculum\Repositories\Contracts\LessonRepositoryInterface;
use App\Modules\Curriculum\Repositories\Contracts\ModuleRepositoryInterface;
use App\Modules\Curriculum\Repositories\DiscussionRepository;
use App\Modules\Curriculum\Repositories\LessonProgressRepository;
use App\Modules\Curriculum\Repositories\LessonRepository;
use App\Modules\Curriculum\Repositories\ModuleRepository;
use Illuminate\Support\ServiceProvider;

class CurriculumServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ModuleRepositoryInterface::class, ModuleRepository::class);
        $this->app->bind(LessonRepositoryInterface::class, LessonRepository::class);
        $this->app->bind(LessonProgressRepositoryInterface::class, LessonProgressRepository::class);
        $this->app->bind(DiscussionRepositoryInterface::class, DiscussionRepository::class);
    }
}
