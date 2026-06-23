<?php

namespace App\Modules\Enrollment\Repositories;

use App\Modules\Enrollment\Models\Invitation;
use App\Modules\Enrollment\Repositories\Contracts\InvitationRepositoryInterface;

class InvitationRepository implements InvitationRepositoryInterface
{
    public function create(array $data): Invitation
    {
        return Invitation::create($data);
    }

    public function findByToken(string $token): ?Invitation
    {
        return Invitation::where('token', hash('sha256', $token))
            ->where('expires_at', '>', now())
            ->whereNull('accepted_at')
            ->first();
    }
}
