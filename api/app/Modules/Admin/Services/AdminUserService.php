<?php

namespace App\Modules\Admin\Services;

use App\Models\User;
use App\Modules\Admin\Exceptions\AdminActionDenied;
use App\Modules\Admin\Repositories\Contracts\AdminUserRepositoryInterface;
use App\Modules\Enrollment\Services\InvitationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class AdminUserService
{
    public function __construct(
        private readonly AdminUserRepositoryInterface $users,
        private readonly InvitationService $invitations,
    ) {}

    public function list(array $filters, int $perPage = 25): LengthAwarePaginator
    {
        return $this->users->paginate($filters, $perPage);
    }

    /** Returns the created User in password mode, or null in invite mode. */
    public function create(User $actor, array $data): ?User
    {
        if ($data['mode'] === 'invite') {
            $this->invitations->inviteWithRole($actor, $data['email'], $data['role']);

            return null;
        }

        $user = $this->users->create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'color'    => '#2747E0',
        ]);

        $this->users->setRole($user, $data['role']);

        return $this->users->findOrFail($user->id);
    }

    public function update(User $actor, string $id, array $data): User
    {
        $user = $this->users->findOrFail($id);

        if (array_key_exists('role', $data) && $data['role'] !== 'admin') {
            $this->assertDemotionAllowed($actor, $user);
        }

        $this->users->updateProfile($user, $data);

        if (array_key_exists('role', $data)) {
            $this->users->setRole($user, $data['role']);
        }

        return $this->users->findOrFail($id);
    }

    public function deactivate(User $actor, string $id): User
    {
        $user = $this->users->findOrFail($id);

        if ($actor->id === $user->id) {
            throw AdminActionDenied::selfAction('deactivate');
        }

        if ($user->hasRole('admin') && $user->isActive() && $this->users->countActiveAdmins() <= 1) {
            throw AdminActionDenied::lastAdmin('deactivate');
        }

        $this->users->setActive($user, false);

        return $this->users->findOrFail($id);
    }

    public function reactivate(string $id): User
    {
        $user = $this->users->findOrFail($id);

        $this->users->setActive($user, true);

        return $this->users->findOrFail($id);
    }

    private function assertDemotionAllowed(User $actor, User $user): void
    {
        if (! $user->hasRole('admin')) {
            return;
        }

        if ($actor->id === $user->id) {
            throw AdminActionDenied::selfAction('demote');
        }

        if ($user->isActive() && $this->users->countActiveAdmins() <= 1) {
            throw AdminActionDenied::lastAdmin('demote');
        }
    }
}
