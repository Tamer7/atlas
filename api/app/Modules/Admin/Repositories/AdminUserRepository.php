<?php

namespace App\Modules\Admin\Repositories;

use App\Models\Role;
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

    public function findForDetail(string $id): User
    {
        return User::with(['roles', 'courses', 'enrollments'])->findOrFail($id);
    }

    public function countActiveAdminsForUpdate(): int
    {
        // Postgres rejects "FOR UPDATE" combined with an aggregate (count()
        // would emit one), so lock the actual candidate rows and count the
        // locked collection in PHP instead of asking the database to
        // count-and-lock in a single query.
        return User::query()
            ->whereNull('deactivated_at')
            ->whereHas('roles', fn ($q) => $q->where('name', 'admin'))
            ->lockForUpdate()
            ->get()
            ->count();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function setRole(User $user, string $role): void
    {
        // Exactly one role per user through the admin UI: replace, never append.
        $user->roles()->sync([Role::firstOrCreate(['name' => $role])->id]);
    }

    public function updateProfile(User $user, array $data): void
    {
        $user->fill(array_intersect_key($data, array_flip(['name', 'email'])))->save();
    }

    public function setActive(User $user, bool $active): void
    {
        // deactivated_at is not in #[Fillable] (see interface docblock); a
        // plain fill()/update() would silently drop it. forceFill() is the
        // deliberate, authorised bypass for this one column.
        $user->forceFill(['deactivated_at' => $active ? null : now()])->save();
    }
}
