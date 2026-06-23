<?php

namespace App\Modules\Enrollment\Repositories\Contracts;

use App\Modules\Enrollment\Models\Invitation;

interface InvitationRepositoryInterface
{
    public function create(array $data): Invitation;
    public function findByToken(string $token): ?Invitation;
}
