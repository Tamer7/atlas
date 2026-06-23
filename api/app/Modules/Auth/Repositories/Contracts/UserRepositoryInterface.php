<?php

namespace App\Modules\Auth\Repositories\Contracts;

use App\Models\User;

interface UserRepositoryInterface
{
    public function create(array $data): User;
    public function findByEmail(string $email): ?User;
    public function createMagicLinkToken(string $email): string;
    public function findByMagicLinkToken(string $token): ?User;
}
