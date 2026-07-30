<?php

namespace App\Modules\Admin\Repositories\Contracts;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AdminUserRepositoryInterface
{
    public function paginate(array $filters, int $perPage): LengthAwarePaginator;

    public function findOrFail(string $id): User;

    /**
     * Loads a user with the relations the admin detail view needs
     * (roles, courses owned as instructor, enrollments) pre-fetched, so the
     * detail resource never triggers per-relation N+1 queries. Kept separate
     * from findOrFail() so list/update paths aren't forced to pay for
     * relations they don't render.
     */
    public function findForDetail(string $id): User;

    /**
     * Counts active admins after locking the matching rows (SELECT ... FOR
     * UPDATE), so concurrent callers serialise on those rows instead of each
     * reading a stale pre-write count. Must be called inside a transaction;
     * the lock is released when that transaction commits or rolls back.
     * This is the only counter in the module — nothing needs an
     * un-locked count, and an un-locked variant sitting alongside this one
     * would just invite a future caller to reintroduce the same race.
     */
    public function countActiveAdminsForUpdate(): int;

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
