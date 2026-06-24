<?php

namespace App\Modules\Live;

use App\Modules\Live\Repositories\Contracts\LiveClassRepositoryInterface;
use App\Modules\Live\Repositories\LiveClassRepository;
use Illuminate\Support\ServiceProvider;

class LiveServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(LiveClassRepositoryInterface::class, LiveClassRepository::class);
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/Routes/api.php');
    }
}
