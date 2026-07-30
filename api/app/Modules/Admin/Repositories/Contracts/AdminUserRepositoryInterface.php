<?php

namespace App\Modules\Admin\Repositories\Contracts;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AdminUserRepositoryInterface
{
    public function paginate(array $filters, int $perPage): LengthAwarePaginator;

    public function findOrFail(string $id): User;

    public function countActiveAdmins(): int;

    public function create(array $data): User;

    public function setRole(User $user, string $role): void;
}
