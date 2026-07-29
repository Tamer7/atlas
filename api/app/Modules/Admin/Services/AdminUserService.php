<?php

namespace App\Modules\Admin\Services;

use App\Modules\Admin\Repositories\Contracts\AdminUserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AdminUserService
{
    public function __construct(
        private readonly AdminUserRepositoryInterface $users
    ) {}

    public function list(array $filters, int $perPage = 25): LengthAwarePaginator
    {
        return $this->users->paginate($filters, $perPage);
    }
}
