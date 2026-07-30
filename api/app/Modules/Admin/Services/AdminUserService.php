<?php

namespace App\Modules\Admin\Services;

use App\Models\User;
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

        return $user->fresh('roles');
    }
}
