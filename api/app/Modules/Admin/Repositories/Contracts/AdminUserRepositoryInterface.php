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

    /** Persists name/email changes. Only these two columns are applied. */
    public function updateProfile(User $user, array $data): void;

    /**
     * Sets or clears deactivated_at. deactivated_at is deliberately excluded
     * from #[Fillable] on User so it cannot be set through a mass-assignable,
     * user-supplied endpoint (e.g. a self-service profile update); this
     * repository method is the one authorised path for changing it on the
     * admin's behalf, so it uses forceFill() to bypass that guard.
     */
    public function setActive(User $user, bool $active): void;
}
