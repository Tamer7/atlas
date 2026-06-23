<?php

namespace App\Modules\Assessment;

use App\Modules\Assessment\Repositories\AnswerRepository;
use App\Modules\Assessment\Repositories\AttemptRepository;
use App\Modules\Assessment\Repositories\Contracts\AnswerRepositoryInterface;
use App\Modules\Assessment\Repositories\Contracts\AttemptRepositoryInterface;
use App\Modules\Assessment\Repositories\Contracts\QuizRepositoryInterface;
use App\Modules\Assessment\Repositories\QuizRepository;
use Illuminate\Support\ServiceProvider;

class AssessmentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(QuizRepositoryInterface::class, QuizRepository::class);
        $this->app->bind(AttemptRepositoryInterface::class, AttemptRepository::class);
        $this->app->bind(AnswerRepositoryInterface::class, AnswerRepository::class);
    }
}
