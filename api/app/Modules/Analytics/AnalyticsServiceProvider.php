<?php

namespace App\Modules\Analytics;

use App\Modules\Analytics\Repositories\AnalyticsRepository;
use App\Modules\Analytics\Repositories\Contracts\AnalyticsRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class AnalyticsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AnalyticsRepositoryInterface::class, AnalyticsRepository::class);
    }
}
