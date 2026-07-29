<?php

namespace App\Modules\Admin\Repositories;

use App\Models\User;
use App\Modules\Admin\Repositories\Contracts\AdminUserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AdminUserRepository implements AdminUserRepositoryInterface
{
    public function paginate(array $filters, int $perPage): LengthAwarePaginator
    {
        return User::query()
            ->with('roles')
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'ilike', "%{$search}%")
                      ->orWhere('email', 'ilike', "%{$search}%");
                });
            })
            ->when($filters['role'] ?? null, function ($query, string $role) {
                $query->whereHas('roles', fn ($q) => $q->where('name', $role));
            })
            ->when($filters['status'] ?? null, function ($query, string $status) {
                $status === 'inactive'
                    ? $query->whereNotNull('deactivated_at')
                    : $query->whereNull('deactivated_at');
            })
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function findOrFail(string $id): User
    {
        return User::with('roles')->findOrFail($id);
    }

    public function countActiveAdmins(): int
    {
        return User::query()
            ->whereNull('deactivated_at')
            ->whereHas('roles', fn ($q) => $q->where('name', 'admin'))
            ->count();
    }
}
